import { useLoadedVaultStore } from "../stores/vault";

export const useConvertToAssets = (shares: bigint) => {
  const totalSupply = useLoadedVaultStore(state => state.totalSupply, true);
  const totalAssets = useLoadedVaultStore(state => state.totalAssets, true);

  return (shares * (totalAssets + 1n)) / totalSupply;
};
