import { useContractRead, erc4626ABI } from "wagmi";

// ABIs
import { VaultAdapter } from "../abis/VaultAdapter";
import { BridgeReceiver } from "../abis/BridgeReceiver";

export const useTotalSupply = (target: `0x${string}`) => {
  return useContractRead({
    address: target,
    abi: erc4626ABI,
    functionName: "totalSupply",
  });
};

/** @notice total reserves */
export const useTotalReserves = (target: `0x${string}`) => {
  return useContractRead({
    address: target,
    abi: erc4626ABI,
    functionName: "totalAssets",
  });
};

/** @notice vault APY */
export const useVaultAPY = (target: `0x${string}`) => {
  return useContractRead({
    address: target,
    abi: VaultAdapter,
    functionName: "vaultAPY",
  });
};

/** @notice vault APY */
export const useReceiverData = (target: `0x${string}`) => {
  const lastClaimTimestamp = useContractRead({
    address: target,
    abi: BridgeReceiver,
    functionName: "lastClaimTimestamp",
  });

  const dripRate = useContractRead({
    address: target,
    abi: BridgeReceiver,
    functionName: "dripRate",
  });

  return { dripRate, lastClaimTimestamp };
};

/** @notice user token Balance */
export const useUserReservesBalance = (
  target: `0x${string}`,
  address: `0x${string}` | undefined,
) => {
  return useContractRead({
    address: target,
    abi: erc4626ABI,
    functionName: "maxWithdraw",
    args: [address ? address : "0x"],
  });
};

/** @notice Convert shares */
export const useConvertToAssets = (target: `0x${string}`, shares: bigint) => {
  return useContractRead({
    address: target,
    abi: erc4626ABI,
    functionName: "convertToAssets",
    args: [shares],
  });
};

/** @notice Convert assets */
export const useConvertToShares = (target: `0x${string}`, deposits?: bigint) => {
  return useContractRead({
    address: target,
    abi: erc4626ABI,
    functionName: "convertToShares",
    args: [deposits ?? 0n],
  });
};
