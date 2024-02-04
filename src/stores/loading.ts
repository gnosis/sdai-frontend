import { create } from "zustand";

interface LoadingState {
  loading: boolean;
  set: (_loading: boolean) => void;
}

export const useLoadingStore = create<LoadingState>()((set) => ({
  loading: false,
  set: (loading) => set({ loading })
}));
