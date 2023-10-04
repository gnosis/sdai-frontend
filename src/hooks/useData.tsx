import { useContractRead, erc4626ABI } from "wagmi";

// ABIs
import { VaultAdapter } from "../abis/VaultAdapter";
import { BridgeReceiver } from "../abis/BridgeReceiver";

// Stores
import { useLoadedAccountStore } from "../stores/account";

export const useTotalSupply = () => {
  const address = useLoadedAccountStore(state => state.chainData.ERC4626_VAULT_ADDRESS, true);
  return useContractRead({
    address,
    abi: erc4626ABI,
    functionName: "totalSupply",
  });
};

/** @notice total reserves */
export const useTotalReserves = () => {
  const address = useLoadedAccountStore(state => state.chainData.ERC4626_VAULT_ADDRESS, true);
  return useContractRead({
    address,
    abi: erc4626ABI,
    functionName: "totalAssets",
  });
};

/** @notice vault APY */
export const useVaultAPY = () => {
  const address = useLoadedAccountStore(state => state.chainData.BRIDGE_RECEIVER, true);
  return useContractRead({
    address,
    abi: BridgeReceiver,
    functionName: "vaultAPY",
  });
};

/** @notice vault APY */
export const useReceiverData = () => {
  const address = useLoadedAccountStore(state => state.chainData.BRIDGE_RECEIVER, true);
  const lastClaimTimestamp = useContractRead({
    address,
    abi: BridgeReceiver,
    functionName: "lastClaimTimestamp",
  });

  const dripRate = useContractRead({
    address,
    abi: BridgeReceiver,
    functionName: "dripRate",
  });

  return { dripRate, lastClaimTimestamp };
};

/** @notice user token Balance */
export const useUserReservesBalance = (user: `0x${string}` | undefined) => {
  const address = useLoadedAccountStore(state => state.chainData.ERC4626_VAULT_ADDRESS, true);
  return useContractRead({
    address,
    abi: erc4626ABI,
    functionName: "maxWithdraw",
    args: [user ? user : "0x"],
  });
};

/** @notice Convert shares */
export const useConvertToAssets = (shares: bigint) => {
  const address = useLoadedAccountStore(state => state.chainData.ERC4626_VAULT_ADDRESS, true);
  return useContractRead({
    address,
    abi: erc4626ABI,
    functionName: "convertToAssets",
    args: [shares],
  });
};

/** @notice Convert assets */
export const useConvertToShares = (deposits?: bigint) => {
  const address = useLoadedAccountStore(state => state.chainData.ERC4626_VAULT_ADDRESS, true);
  return useContractRead({
    address,
    abi: erc4626ABI,
    functionName: "convertToShares",
    args: [deposits ?? 0n],
  });
};
