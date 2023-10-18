import { create } from "zustand";
import { erc4626ABI } from "wagmi";
import { getPublicClient, readContract } from "wagmi/actions";
import { useShallow } from "zustand/shallow";

// Hooks
import { isLoadedChainStore, useChainStore } from "./chain";

// ABIs
import { BridgeReceiver } from "../abis/BridgeReceiver";

// Fetching singleton
let currentlyLoading: number | undefined;

export interface VaultStore {
  loading: boolean;
  fetch: () => Promise<void>;
  watch: () => void;
}

export interface VaultStoreNotLoaded extends VaultStore {
  loading: true;
}

export interface VaultStoreLoaded extends VaultStore {
  loading: false;
  totalSupply: bigint;
  totalAssets: bigint;
  apy: bigint;
  lastClaimTimestamp: bigint;
  dripRate: bigint;
}

export type AnyVaultStore = VaultStoreNotLoaded | VaultStoreLoaded;

export const useVaultStore = create<AnyVaultStore>((set, get) => ({
  loading: true,
  fetch: async () => {
    // Current chain data
    const chainState = useChainStore.getState();
    if (!isLoadedChainStore(chainState)) {
      return;
    }

    const { id: chainId, addresses } = chainState;
    const { vault, bridgeReceiver } = addresses;

    // Fix a race condition on the first load where the chain is not the connected one
    const client = getPublicClient();
    if (client.chain.id !== chainId) {
      return;
    }

    // This prevents the fetch function from running twice for the same address and chainData
    if (currentlyLoading === chainId) {
      return;
    }

    currentlyLoading = chainId;

    // Fetch data
    const [totalSupply, totalAssets, apy, lastClaimTimestamp, dripRate] = await Promise.all([
      readContract({
        address: vault,
        abi: erc4626ABI,
        functionName: "totalSupply",
      }),
      readContract({
        address: vault,
        abi: erc4626ABI,
        functionName: "totalAssets",
      }),
      readContract({
        address: bridgeReceiver,
        abi: BridgeReceiver,
        functionName: "vaultAPY",
      }),
      readContract({
        address: bridgeReceiver,
        abi: BridgeReceiver,
        functionName: "lastClaimTimestamp",
      }),
      readContract({
        address: bridgeReceiver,
        abi: BridgeReceiver,
        functionName: "dripRate",
      }),
    ]);

    // This makes sure that the address and chainData haven't change since the fetch function was called
    if (currentlyLoading !== chainId) {
      return;
    }

    currentlyLoading = undefined;
    set({
      loading: false,
      totalSupply,
      totalAssets,
      apy,
      lastClaimTimestamp,
      dripRate,
    });
  },
  watch: () => {
    return useChainStore.subscribe(() => get().fetch());
  },
}));

export const isLoadedVaultStore = <
  S extends Partial<AnyVaultStore> & Pick<AnyVaultStore, "loading">,
>(
  store: S,
): store is Partial<VaultStoreLoaded> & Pick<VaultStoreLoaded, "loading"> & S => {
  return !store.loading;
};

export const useLoadedVaultStore = <U, T extends true | false>(
  selector: (state: VaultStoreLoaded) => U,
  throwError?: T,
): U | (T extends true ? never : false) => {
  const result = useVaultStore(state => isLoadedVaultStore(state) && selector(state));
  if (!result && throwError) {
    throw new Error("rendered without vault");
  }
  return result as U;
};

export const useIsVaultStoreLoaded = () => {
  const state = useVaultStore(
    useShallow(state => ({
      loading: state.loading,
    })),
  );
  return isLoadedVaultStore(state);
};
