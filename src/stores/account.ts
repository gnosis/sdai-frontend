import { create } from "zustand";
import {
  FetchBalanceResult,
  fetchBalance,
  getPublicClient,
  readContract,
  watchAccount,
} from "wagmi/actions";
import { useShallow } from "zustand/shallow";
import { erc4626ABI } from "wagmi";

// Constants
import { getTokenAllowance } from "../utils/wagmi";

// Hooks
import { isLoadedChainStore, useChainStore } from "./chain";

// Fetching singleton
let currentlyLoading:
  | {
      chainId: number;
      address: `0x${string}`;
    }
  | undefined;

export interface AccountStore {
  address?: `0x${string}` | undefined;
  loading: boolean;
  setAddress: (address: `0x${string}` | undefined) => Promise<void>;
  fetch: () => Promise<void>;
  watch: () => void;
  isDenied: boolean;
}

export interface AccountStoreLoaded extends AccountStore {
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

export const useAccountStore = create<AnyAccountStore>((set, get) => ({
  address: undefined,
  isDenied: false,
  loading: false,
  setAddress: async (address: `0x${string}` | undefined) => {
    set({ address, loading: true });
    try {
      const response = await fetch(`https://sdai-api.dev.gnosisdev.com/api/v1/denylist/${address}`);
      const data = await response.json();
      set({ isDenied: data.denied });
    } catch (error) {
      set({ isDenied: false });
    }
    return get().fetch();
  },
  fetch: async () => {
    const { address } = get();
    if (!address) {
      return;
    }

    // Current chain data
    const chainState = useChainStore.getState();
    if (!isLoadedChainStore(chainState)) {
      return;
    }

    const { id: chainId, addresses } = chainState;
    const { reserveToken, vault, vaultAdapter } = addresses;

    // Fix a race condition on the first load where the chain is not the connected one
    const client = getPublicClient();
    if (client.chain.id !== chainId) {
      return;
    }

    // This prevents the fetch function from running twice for the same address and chainData
    if (currentlyLoading?.address === address && currentlyLoading?.chainId === chainId) {
      return;
    }

    currentlyLoading = { address, chainId };

    const [
      nativeBalance,
      wrappedBalance,
      sharesBalance,
      reservesBalance,
      depositAllowance,
      withdrawAllowance,
    ] = await Promise.all([
      fetchBalance({ address }),
      fetchBalance({ address, token: reserveToken }),
      fetchBalance({ token: vault, address }),
      readContract({
        address: vault,
        abi: erc4626ABI,
        functionName: "maxWithdraw",
        args: [address],
      }),
      getTokenAllowance(reserveToken, address, vaultAdapter),
      getTokenAllowance(vault, address, vaultAdapter),
    ]);

    // This makes sure that the address and chainData haven't change since the fetch function was called
    if (currentlyLoading.address !== address || currentlyLoading.chainId !== chainId) {
      return;
    }

    currentlyLoading = undefined;
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
      // account.address && get().setAddress(account.address);
      account.address && get().setAddress(account.address);
      if (account.address) {
        get().setAddress(account.address);
      } else {
        get().setAddress(undefined);
      }
    });

    const unwatchChain = useChainStore.subscribe(() => get().fetch());

    return () => {
      unwatchAccount();
      unwatchChain();
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

export const useIsAccountStoreLoaded = () => {
  const state = useAccountStore(
    useShallow(state => ({
      address: state.address,
      loading: state.loading,
    })),
  );
  return isLoadedAccountStore(state);
};
