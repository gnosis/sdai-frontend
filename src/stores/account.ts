import { create } from "zustand";
import { FetchBalanceResult, fetchBalance, readContract, watchAccount } from "wagmi/actions";

// Constants
import { ERC4626_VAULT_ADDRESS, RESERVE_TOKEN_ADDRESS } from "../constants";
import { erc4626ABI } from "wagmi";
import { getTokenAllowance } from "../utils/wagmi";

export interface AccountStore {
  address?: `0x${string}`;
  loading: boolean;
  setAddress: (address: `0x${string}`) => Promise<void>;
  fetch: () => Promise<void>;
  watch: () => void;
}

export interface AccountStoreLoaded extends AccountStore {
  address: `0x${string}`;
  loading: false;
  nativeBalance: FetchBalanceResult;
  wrappedBalance: FetchBalanceResult;
  sharesBalance: FetchBalanceResult;
  reservesBalance: bigint;
  maxWithdrawBalance: bigint;
  depositAllowance: bigint;
  withdrawAllowance: bigint;
}

export interface AccountStoreLoading extends AccountStore {
  loading: true;
}

export interface AccountStoreEmpty extends AccountStore {
  address: undefined;
  loading: false;
}

export type AnyAccountStore = AccountStoreLoaded | AccountStoreLoading | AccountStoreEmpty;

export const useAccountStore = create<AnyAccountStore>((set, get) => ({
  address: undefined,
  loading: false,
  setAddress: async (address: `0x${string}`) => {
    set({ address, loading: true });
    return get().fetch();
  },
  fetch: async () => {
    const { address } = get();
    if (!address) {
      return;
    }

    const [
      nativeBalance,
      wrappedBalance,
      sharesBalance,
      reservesBalance,
      maxWithdrawBalance,
      depositAllowance,
      withdrawAllowance,
    ] = await Promise.all([
      fetchBalance({ address }),
      fetchBalance({ address, token: RESERVE_TOKEN_ADDRESS }),
      fetchBalance({ token: ERC4626_VAULT_ADDRESS, address }),
      readContract({
        address: ERC4626_VAULT_ADDRESS,
        abi: erc4626ABI,
        functionName: "maxWithdraw",
        args: [address],
      }),
      readContract({
        address: ERC4626_VAULT_ADDRESS,
        abi: erc4626ABI,
        functionName: "maxWithdraw",
        args: [address],
      }),
      getTokenAllowance(RESERVE_TOKEN_ADDRESS, address),
      getTokenAllowance(ERC4626_VAULT_ADDRESS, address),
    ]);

    set({
      loading: false,
      nativeBalance,
      wrappedBalance,
      sharesBalance,
      reservesBalance,
      maxWithdrawBalance,
      depositAllowance,
      withdrawAllowance,
    });
  },
  watch: () => watchAccount(account => account.address && get().setAddress(account.address)),
}));

export const isLoadedAccountStore = (store: AccountStore): store is AccountStoreLoaded => {
  return !!store.address && !store.loading;
};

export const useLoadedAccountStore = <U>(selector: (state: AccountStoreLoaded) => U): U | false => {
  return useAccountStore(state => isLoadedAccountStore(state) && selector(state));
};
