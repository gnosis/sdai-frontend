import { useLoadedVaultStore } from "../stores/vault";

export const useConvertToShares = (assets: bigint) => {
  const totalSupply = useLoadedVaultStore(state => state.totalSupply, true);
  const totalAssets = useLoadedVaultStore(state => state.totalAssets, true);

  return (assets * totalSupply) / (totalAssets + 1n);
};
