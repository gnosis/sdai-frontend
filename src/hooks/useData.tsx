import { useCallback } from "react";
import * as React from 'react'
import { ethers, BigNumber } from "ethers";
import {
  usePrepareContractWrite,
  useContractWrite,
  useBalance,
  useAccount,
  useContractRead,
} from "wagmi";
import { useDebounce } from 'usehooks-ts'
import ERC20Abi from "../abis/MyVaultTokenERC20.json";
import ERC4626Abi from "../abis/MyVaultTokenERC4626.json";
import RouterAbi from "../abis/VaultRouter.json";
import { parseEther } from "viem";

// Addresses
const VAULT_ROUTER_ADDRESS = "0x0EA5928162b0F74BAEf31c00A04A4cEC5Fe9f4b2";
const RESERVE_TOKEN_ADDRESS = "0x18c8a7ec7897177E4529065a7E7B0878358B3BfF";
const ERC4626_VAULT_ADDRESS = "0x20e5eB701E8d711D419D444814308f8c2243461F";

export const useTotalSupply = () => {
  const debounced = useDebounce("totalSupply",10000);
  const res = useContractRead({
    address: ERC4626_VAULT_ADDRESS,
    abi: ERC4626Abi,
    functionName: "totalSupply",
    enabled: Boolean(debounced),
  }).data;
  if (!res) {
    return "-";
  }
  return ethers.utils.commify((+ethers.utils.formatUnits(res.toString())).toFixed(2));
};

/** @notice total reserves */
export const useTotalReserves = () => {
  const res = useContractRead({
    address: ERC4626_VAULT_ADDRESS,
    abi: ERC4626Abi,
    functionName: "totalAssets",
  }).data;
  if (!res) {
    return "-";
  }
  return ethers.utils.commify((+ethers.utils.formatUnits(res.toString())).toFixed(2));
};

/** @notice vault APY */
export const useVaultAPY = () => {
  const res = useContractRead({
    address: VAULT_ROUTER_ADDRESS,
    abi: RouterAbi,
    functionName: "vaultAPY",
  }).data;
  if (!res) {
    return "-";
  }
  return (+ethers.utils.formatUnits(res.toString(), 16)).toFixed(3);
};

export const useTokenAllowance = (token: `0x${string}`, address: `0x${string}` | undefined) => {
  const res = useContractRead({
    address: token,
    abi: ERC20Abi,
    functionName: "allowance",
    args: [address, VAULT_ROUTER_ADDRESS],
  }).data;
  if (!res) {
    return BigNumber.from(0);
  }
  return BigNumber.from(res);
};

/** @notice user native Balance */
export const useUserBalance = (address: `0x${string}` | undefined) => {
  const res = useBalance({
    address: address,
  }).data;
  if (!res) {
    return "0";
  }
  return ethers.utils.commify((+ethers.utils.formatUnits(res.value)).toFixed(2));
};

/** @notice user token Balance */
export const useUserBalanceToken = (token: `0x${string}`, address: `0x${string}` | undefined) => {
  const res = useBalance({
    address: address,
    token: token,
  }).data;
  if (!res) {
    return "0";
  }
  return ethers.utils.commify((+ethers.utils.formatUnits(res.value)).toFixed(2));
};

/** @notice Approve assets before deposit */
export const ApproveAssets: React.FC<{amount:BigNumber}> = ({amount}) =>{
  const { config } = usePrepareContractWrite({
    address: RESERVE_TOKEN_ADDRESS,
    abi: ERC20Abi,
    functionName: "approve",
    args: [VAULT_ROUTER_ADDRESS, amount],
  });
  const { write } = useContractWrite(config);
  return (
    <div
    className="page-component__main__input__action-btn"
    onClick={() => write?.()}
  >
    Approve
  </div>
  )
};

/** @notice Approve shares before withdrawal */
export const ApproveShares: React.FC<{amount:BigNumber}> =({amount}) =>{
    const { config } = usePrepareContractWrite({
      address: ERC4626_VAULT_ADDRESS,
      abi: ERC20Abi,
      functionName: "approve",
      args: [VAULT_ROUTER_ADDRESS, ethers.utils.formatUnits(amount)],
    });
    const { write } = useContractWrite(config);
    return (
      <div
      className="page-component__main__input__action-btn"
      onClick={() => write?.()}
    >
      Approve
    </div>
    )
  };


/** @notice Deposit assets of `MY_VAULT_TOKEN` into the ERC4626 vault */
export const DepositNativeAssets: React.FC<{amount: BigNumber, receiver: string}> = ({amount, receiver}) =>{
    console.log(amount, receiver)
    const { config } = usePrepareContractWrite({
      address: VAULT_ROUTER_ADDRESS,
      abi: RouterAbi,
      functionName: "depositXDAI",
      args: [receiver],
      value: parseEther(ethers.utils.formatUnits(amount),"wei"),
    });
    const { write } = useContractWrite(config);
    return (
      <div
      className="page-component__main__input__action-btn"
      onClick={() => write?.()}
    >
      Deposita
    </div>
    )
  };

/** @notice Deposit assets of `MY_VAULT_TOKEN` into the ERC4626 vault */
export const DepositAssets: React.FC<{amount: BigNumber, receiver: string}> = (amount, receiver) =>{
    const { config } = usePrepareContractWrite({
      address: VAULT_ROUTER_ADDRESS,
      abi: RouterAbi,
      functionName: "deposit",
      args: [amount, receiver],
    });
    const { write } = useContractWrite(config);
    return (
      <div
      className="page-component__main__input__action-btn"
      onClick={() => write?.()}
    >
      Deposit
    </div>
    )
  };


/** @notice Redeem shares */
export const RedeemShares = (amount: BigNumber, receiver: string) => {
  const { config } = usePrepareContractWrite({
    address: VAULT_ROUTER_ADDRESS,
    abi: RouterAbi,
    functionName: "redeem",
    args: [amount, receiver],
  });
  useContractWrite(config);
};

/** @notice Redeem shares */
export const RedeemSharesToNative = (amount: BigNumber, receiver: string) => {
  const { config } = usePrepareContractWrite({
    address: VAULT_ROUTER_ADDRESS,
    abi: RouterAbi,
    functionName: "redeemXDAI",
    args: [amount, receiver],
  });
  useContractWrite(config);
};

/** @notice Convert shares */
export const useConvertToAssets = (shares: BigNumber) => {
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
export const useConvertToShares = (deposits: BigNumber) => {
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
