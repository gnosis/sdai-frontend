import React from "react";
import { useContractRead, erc4626ABI, erc20ABI } from "wagmi";

// ABIs
import { VaultAdapter } from "../abis/VaultAdapter";

// Constants
import { ERC4626_VAULT_ADDRESS, VAULT_ROUTER_ADDRESS } from "../constants";

export const useTotalSupply = () => {
  return useContractRead({
    address: ERC4626_VAULT_ADDRESS,
    abi: erc4626ABI,
    functionName: "totalSupply",
  });
};

/** @notice total reserves */
export const useTotalReserves = () => {
  return useContractRead({
    address: ERC4626_VAULT_ADDRESS,
    abi: erc4626ABI,
    functionName: "totalAssets",
  });
};

/** @notice vault APY */
export const useVaultAPY = () => {
  return useContractRead({
    address: VAULT_ROUTER_ADDRESS,
    abi: VaultAdapter,
    functionName: "vaultAPY",
  });
};

export const useTokenAllowance = (token: `0x${string}`, address: `0x${string}` | undefined) => {
  return useContractRead({
    address: token,
    abi: erc20ABI,
    functionName: "allowance",
    args: [address ? address : "0x", VAULT_ROUTER_ADDRESS],
  });
};

/** @notice user token Balance */
export const useUserReservesBalance = (address: `0x${string}` | undefined) => {
  return useContractRead({
    address: ERC4626_VAULT_ADDRESS,
    abi: erc4626ABI,
    functionName: "maxWithdraw",
    args: [address ? address : "0x"],
  });
};

export const NoReceiver = () => {
  return <div className="page-component__main__input__action-btn">Add Receiver</div>;
};

/** @notice Convert shares */
export const useConvertToAssets = (shares: bigint) => {
  return useContractRead({
    address: ERC4626_VAULT_ADDRESS,
    abi: erc4626ABI,
    functionName: "convertToAssets",
    args: [shares],
  });
};

/** @notice Convert assets */
export const useConvertToShares = (deposits: bigint) => {
  return useContractRead({
    address: ERC4626_VAULT_ADDRESS,
    abi: erc4626ABI,
    functionName: "convertToShares",
    args: [deposits],
  });
};
