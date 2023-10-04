import { create } from "zustand";
import { FetchBalanceResult, fetchBalance, readContract, watchAccount, watchNetwork } from "wagmi/actions";

// Constants
import { supportedChains, ChainData } from "../constants";
import { erc4626ABI } from "wagmi";
import { getTokenAllowance } from "../utils/wagmi";

export interface AccountStore {
  chainData: ChainData;
  address?: `0x${string}`;
  loading: boolean;
  setChainData: (chainData: ChainData) => Promise<void>;
  setAddress: (address: `0x${string}`) => Promise<void>;
  fetch: () => Promise<void>;
  watch: () => void;
}

export interface AccountStoreLoaded extends AccountStore {
  chainData: ChainData;
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

export const getChainData = (id: number) => {
  const data = supportedChains.find(x => x.chainId === id);
  return data;
}

export const useAccountStore = create<AnyAccountStore>((set, get) => ({
  chainData: supportedChains[0],
  address: undefined,
  loading: false,
  setAddress: async (address: `0x${string}`) => {
    set({ address, loading: true });
    return get().fetch();
  },
  setChainData: async (chainData: ChainData) => {
    set({ chainData });
    return get().fetch();
  },
  fetch: async () => {
    const { address, chainData } = get();
    if (!address || !chainData) return;

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
      fetchBalance({ address, token: chainData.RESERVE_TOKEN_ADDRESS }),
      fetchBalance({ token: chainData.ERC4626_VAULT_ADDRESS, address }),
      readContract({
        address: chainData.ERC4626_VAULT_ADDRESS,
        abi: erc4626ABI,
        functionName: "maxWithdraw",
        args: [address],
      }),
      readContract({
        address: chainData.ERC4626_VAULT_ADDRESS,
        abi: erc4626ABI,
        functionName: "maxWithdraw",
        args: [address],
      }),
      getTokenAllowance(chainData.RESERVE_TOKEN_ADDRESS, address, chainData.VAULT_ADAPTER_ADDRESS),
      getTokenAllowance(chainData.ERC4626_VAULT_ADDRESS, address, chainData.VAULT_ADAPTER_ADDRESS),
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
  watch: () => {
    watchAccount(account => {
      account.address && get().setAddress(account.address);
    });
    watchNetwork(network => {
      if (network.chain) {
        const data = getChainData(network.chain.id);
        data && get().setChainData(data);
      }
    })

  }
}));

export const isLoadedAccountStore = (store: AccountStore): store is AccountStoreLoaded => {
  return !!store.address && !store.loading;
};

export const useLoadedAccountStore = <U>(selector: (state: AccountStoreLoaded) => U): U | false => {
  return useAccountStore(state => isLoadedAccountStore(state) && selector(state));
};
