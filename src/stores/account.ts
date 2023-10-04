import { create } from "zustand";
import {
  FetchBalanceResult,
  fetchBalance,
  getPublicClient,
  readContract,
  watchAccount,
  watchNetwork,
} from "wagmi/actions";

// Constants
import { supportedChains, ChainData } from "../constants";
import { erc4626ABI } from "wagmi";
import { getTokenAllowance } from "../utils/wagmi";

// Fetching singleton
let currentingLoading:
  | {
      chainData: ChainData;
      address: `0x${string}`;
    }
  | undefined;

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
};

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
    if (!address || !chainData) {
      return;
    }

    // Fix a race condition on the first load where the chain is not the connected one
    const client = getPublicClient();
    if (client.chain.id !== chainData.chainId) {
      return;
    }

    // This prevents the fetch function from running twice for the same address and chainData
    if (currentingLoading?.address === address && currentingLoading?.chainData === chainData) {
      return;
    }

    currentingLoading = { address, chainData };

    const [
      nativeBalance,
      wrappedBalance,
      sharesBalance,
      reservesBalance,
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
      getTokenAllowance(chainData.RESERVE_TOKEN_ADDRESS, address, chainData.VAULT_ADAPTER_ADDRESS),
      getTokenAllowance(chainData.ERC4626_VAULT_ADDRESS, address, chainData.VAULT_ADAPTER_ADDRESS),
    ]);

    // This makes sure that the address and chainData haven't change since the fetch function was called
    if (currentingLoading.address !== address || currentingLoading.chainData !== chainData) {
      return;
    }

    set({
      loading: false,
      nativeBalance,
      wrappedBalance,
      sharesBalance,
      reservesBalance,
      depositAllowance,
      withdrawAllowance,
    });
  },
  watch: () => {
    const unwatchAccount = watchAccount(account => {
      account.address && get().setAddress(account.address);
    });

    const unwatchNetwork = watchNetwork(network => {
      network.chain;
      if (network.chain) {
        const data = getChainData(network.chain.id);
        data && get().setChainData(data);
      }
    });

    return () => {
      unwatchAccount();
      unwatchNetwork();
    };
  },
}));

export const isLoadedAccountStore = <
  S extends Partial<AccountStore> & Pick<AccountStore, "address" | "loading">,
>(
  store: S,
): store is Partial<AccountStoreLoaded> & Pick<AccountStoreLoaded, "address" | "loading"> & S => {
  return !!store.address && !store.loading;
};

export const useLoadedAccountStore = <U, T extends true | false>(
  selector: (state: AccountStoreLoaded) => U,
  throwError?: T,
): U | (T extends true ? never : false) => {
  const result = useAccountStore(state => isLoadedAccountStore(state) && selector(state));
  if (!result && throwError) {
    throw new Error("rendered without account");
  }
  return result as U;
};
