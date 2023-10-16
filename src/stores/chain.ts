import { create } from "zustand";
import { watchNetwork } from "wagmi/actions";

// Constants
import { ChainConfig, getChainData } from "../constants";

export interface ChainStore {
  id?: number;
  watch: () => void;
}

export interface ChainStoreNotLoaded extends ChainStore {
  id: undefined;
}

export interface ChainStoreLoaded extends ChainStore, ChainConfig {
  id: number;
}

export type AnyChainStore = ChainStoreNotLoaded | ChainStoreLoaded;

export const useChainStore = create<AnyChainStore>(set => ({
  id: undefined,
  watch: () => {
    return watchNetwork(network => {
      const data = network.chain && getChainData(network.chain.id);
      data && set(data);
    });
  },
}));

export const isLoadedChainStore = <S extends Partial<AnyChainStore> & Pick<AnyChainStore, "id">>(
  store: S,
): store is Partial<ChainStoreLoaded> & Pick<ChainStoreLoaded, "id"> & S => {
  return !!store.id;
};

export const useLoadedChainStore = <U>(selector: (state: ChainStoreLoaded) => U): U => {
  const result = useChainStore(state => isLoadedChainStore(state) && selector(state));
  if (!result) {
    throw new Error("rendered without chain");
  }
  return result as U;
};
