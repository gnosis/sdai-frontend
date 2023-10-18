import { WEI_PER_ETHER } from "../constants";
import { useLoadedVaultStore } from "../stores/vault";

export const useVaultAPY = () => {
  const totalAssets = useLoadedVaultStore(state => state.totalAssets, true);
  const dripRate = useLoadedVaultStore(state => state.dripRate, true);

  return (dripRate * 365n * 24n * 60n * 60n * WEI_PER_ETHER) / totalAssets;
};
