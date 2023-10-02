import { create } from "zustand";
import { FetchBalanceResult, fetchBalance, readContract, watchAccount } from "wagmi/actions";

// Constants
import { ERC4626_VAULT_ADDRESS, RESERVE_TOKEN_ADDRESS } from "../constants";
import { erc4626ABI } from "wagmi";

interface AccountStore {
  address?: `0x${string}`;
  loading: boolean;
  setAddress: (address: `0x${string}`) => Promise<void>;
  fetch: () => Promise<void>;
  watch: () => void;
}

interface AccountStoreLoaded extends AccountStore {
  address: `0x${string}`;
  loading: false;
  nativeBalance: FetchBalanceResult;
  wrappedBalance: FetchBalanceResult;
  sharesBalance: FetchBalanceResult;
  reservesBalance: bigint;
  maxWithdrawBalance: bigint;
}

interface AccountStoreLoading extends AccountStore {
  loading: true;
}

interface AccountStoreEmpty extends AccountStore {
  address: undefined;
  loading: false;
}

type AnyAccountStore = AccountStoreLoaded | AccountStoreLoading | AccountStoreEmpty;

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

    const [nativeBalance, wrappedBalance, sharesBalance, reservesBalance, maxWithdrawBalance] =
      await Promise.all([
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
      ]);

    set({
      loading: false,
      nativeBalance,
      wrappedBalance,
      sharesBalance,
      reservesBalance,
      maxWithdrawBalance,
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
