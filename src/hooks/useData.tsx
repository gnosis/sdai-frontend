import React, { useEffect } from "react";
import { ethers } from "ethers";
import {
  usePrepareContractWrite,
  useContractWrite,
  useBalance,
  useContractRead,
  erc4626ABI,
  useWaitForTransaction,
  useAccount,
} from "wagmi";
import { useDebounce } from "usehooks-ts";
import ERC20Abi from "../abis/MyVaultTokenERC20.json";
import ERC4626Abi from "../abis/MyVaultTokenERC4626.json";
import RouterAbi from "../abis/VaultAdapter.json";
import "../constants";
import { ZERO } from "../constants";

// Addresses
const VAULT_ROUTER_ADDRESS = "0x0EA5928162b0F74BAEf31c00A04A4cEC5Fe9f4b2";
const RESERVE_TOKEN_ADDRESS = "0x18c8a7ec7897177E4529065a7E7B0878358B3BfF";
const ERC4626_VAULT_ADDRESS = "0x20e5eB701E8d711D419D444814308f8c2243461F";

export const useTotalSupply = () => {
  const res = useContractRead({
    address: ERC4626_VAULT_ADDRESS,
    abi: ERC4626Abi,
    functionName: "totalSupply",
  }).data;
  if (!res) {
    return ZERO;
  }
  return BigInt((res).toString())
};

/** @notice total reserves */
export const useTotalReserves = () => {
  const res = useContractRead({
    address: ERC4626_VAULT_ADDRESS,
    abi: ERC4626Abi,
    functionName: "totalAssets",
  }).data;
  if (!res) {
    return ZERO;
  }
  return BigInt((res).toString());
};

/** @notice vault APY */
export const useVaultAPY = () => {
  const res = useContractRead({
    address: VAULT_ROUTER_ADDRESS,
    abi: RouterAbi,
    functionName: "vaultAPY",
  }).data;
  if (!res) {
    return ZERO;
  }
  return BigInt((res).toString());
};

export const useTokenAllowance = (token: `0x${string}`, address: `0x${string}` | undefined) => {
  const res = useContractRead({
    address: token,
    abi: ERC20Abi,
    functionName: "allowance",
    args: [address ? address : "0x", VAULT_ROUTER_ADDRESS],
  }).data;
  if (!res) {
    return ZERO;
  }
  return BigInt((res).toString());
};

/** @notice user native Balance */
export const useUserBalance = (address: `0x${string}` | undefined) => {
  const res = useBalance({
    address: address,
  }).data;
  if (!res) {
    return ZERO;
  }
  return BigInt(res.value);
};

/** @notice user token Balance */
export const useUserBalanceToken = (token: `0x${string}`, address: `0x${string}` | undefined) => {
  const res = useBalance({
    address: address,
    token: token,
  }).data;
  if (!res) {
    return ZERO;
  }
  return BigInt(res.value);
};

/** @notice user token Balance */
export const useUserReservesBalance = (address: `0x${string}` | undefined) => {
  const res = useContractRead({
    address: ERC4626_VAULT_ADDRESS,
    abi: erc4626ABI,
    functionName: "maxWithdraw",
    args: [address ? address : "0x"],
  }).data;
  if (!res) {
    return ZERO;
  }
  return BigInt((res).toString());
};

export const NoReceiver = () => {
  return <div className="page-component__main__input__action-btn">Add Receiver</div>;
};

/** @notice Convert shares */
export const useConvertToAssets = (shares: BigInt) => {
  const res = useContractRead({
    address: ERC4626_VAULT_ADDRESS,
    abi: ERC4626Abi,
    functionName: "convertToAssets",
    args: [shares],
  }).data;
  if (!res) {
    return "0";
  }
  return res.toString();
};

/** @notice Convert assets */
export const useConvertToShares = (deposits: BigInt) => {
  const res = useContractRead({
    address: ERC4626_VAULT_ADDRESS,
    abi: ERC4626Abi,
    functionName: "convertToShares",
    args: [deposits],
  }).data;
  if (!res) {
    return "0";
  }
  return res.toString();
};
