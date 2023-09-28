import React, { useEffect } from "react";
import { ethers, BigNumber } from "ethers";
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
import RouterAbi from "../abis/VaultRouter.json";

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
    return "-";
  }
  const shares = ethers.utils.commify((+ethers.utils.formatUnits(res.toString())).toFixed(2));
  return shares;
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
    return BigNumber.from(0);
  }
  return BigNumber.from(res.value);
};

/** @notice user token Balance */
export const useUserBalanceToken = (token: `0x${string}`, address: `0x${string}` | undefined) => {
  const res = useBalance({
    address: address,
    token: token,
  }).data;
  if (!res) {
    return BigNumber.from(0);
  }
  return BigNumber.from(res.value);
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
    return BigNumber.from(0);
  }
  return BigNumber.from(res);
};

/** @notice Approve assets before deposit */
export const ApproveAssets: React.FC<{
  amount: BigNumber;
  setDepositAllowance: React.Dispatch<React.SetStateAction<ethers.BigNumber | undefined>>;
}> = ({ amount, setDepositAllowance }) => {
  const { config } = usePrepareContractWrite({
    address: RESERVE_TOKEN_ADDRESS,
    abi: ERC20Abi,
    functionName: "approve",
    args: [VAULT_ROUTER_ADDRESS, amount.toBigInt()],
  });
  const { write, isSuccess, isError } = useContractWrite(config);
  console.log(amount.toString(), isSuccess, isError);

  useEffect(() => {
    if (isSuccess) setDepositAllowance(amount);
  }, [amount, isSuccess, setDepositAllowance]);
  return (
    <div
      className="page-component__main__input__action-btn"
      onClick={() => {
        write?.();
      }}
    >
      Approve
    </div>
  );
};

/** @notice Approve shares before withdrawal */
export const ApproveShares: React.FC<{
  amount: BigNumber;
  setWithdrawAllowance: React.Dispatch<React.SetStateAction<ethers.BigNumber | undefined>>;
}> = ({ amount, setWithdrawAllowance }) => {
  const { config } = usePrepareContractWrite({
    address: ERC4626_VAULT_ADDRESS,
    abi: ERC20Abi,
    functionName: "approve",
    args: [VAULT_ROUTER_ADDRESS, amount.toBigInt()],
  });
  const { write, isSuccess } = useContractWrite(config);

  useEffect(() => {
    if (isSuccess) setWithdrawAllowance(amount);
  }, [isSuccess, setWithdrawAllowance, amount]);

  return (
    <div className="page-component__main__input__action-btn" onClick={() => write?.()}>
      Approve
    </div>
  );
};

/** @notice Deposit assets of `MY_VAULT_TOKEN` into the ERC4626 vault */
export const DepositNativeAssets: React.FC<{
  disabled: boolean;
  amount: BigNumber;
  receiver: string;
  setXDAIBalance: React.Dispatch<React.SetStateAction<BigNumber | undefined>>;
  setReservesBalance: React.Dispatch<React.SetStateAction<BigNumber | undefined>>;
}> = ({ disabled, amount, receiver, setXDAIBalance, setReservesBalance }) => {
  const { address } = useAccount();
  const reservesBalance = useUserReservesBalance(address);
  const XDAIBalance = useUserBalance(address);
  const { config } = usePrepareContractWrite({
    address: VAULT_ROUTER_ADDRESS,
    abi: RouterAbi,
    functionName: "depositXDAI",
    args: [receiver],
    value: amount.toBigInt(),
  });
  const { write, data } = useContractWrite(config);
  const waitForTransaction = useWaitForTransaction({
    confirmations: 1,
    hash: data?.hash,
  });
  let runOnce = true;
  useEffect(() => {
    if (
      runOnce &&
      waitForTransaction &&
      waitForTransaction.isSuccess &&
      XDAIBalance &&
      amount &&
      reservesBalance
    ) {
      setXDAIBalance(XDAIBalance.sub(amount));
      setReservesBalance(reservesBalance.add(amount));
      console.log("great success!!");
      runOnce = false;
    }
  }, [waitForTransaction]);

  return (
    <div className="full-width">
      <div
        className="page-component__main__input__action-btn"
        onClick={() => {
          if (!disabled) write?.();
        }}
      >
        Deposit
      </div>
      {waitForTransaction.isSuccess ? (
        <a className="page-component__main__input__action-tx"
          href={
            "https://gnosis-chiado.blockscout.com/tx/" + waitForTransaction.data?.transactionHash
          }
        >
          View on Explorer
        </a>
      ) : null}
    </div>
  );
};

/** @notice Deposit assets of `MY_VAULT_TOKEN` into the ERC4626 vault */
export const DepositAssets: React.FC<{
  disabled: boolean;
  amount: BigNumber;
  receiver: string;
  updater:any;
}> = ({ disabled, amount, receiver, updater }) => {
  const { address } = useAccount();
  const { config } = usePrepareContractWrite({
    address: VAULT_ROUTER_ADDRESS,
    abi: RouterAbi,
    functionName: "deposit",
    args: [amount.toBigInt(), receiver],
  });
  const { write, data } = useContractWrite(config);
  const waitForTransaction = useWaitForTransaction({
    confirmations: 1,
    hash: data?.hash,
  });
  const reservesBalance = useUserReservesBalance(address);
  const assetBalance = useUserBalanceToken(RESERVE_TOKEN_ADDRESS, address);

  let runOnce = true;
  useEffect(() => {
    if (runOnce && waitForTransaction && waitForTransaction.isSuccess && amount) {
      updater()
      console.log("great success!!");
      runOnce = false;
    }
  }, [waitForTransaction]);

  return (
    <div className="full-width">
      <div
        className="page-component__main__input__action-btn"
        onClick={() => {
          if (!disabled) write?.();
        }}
      >
        Deposit
      </div>
      {waitForTransaction.isSuccess ? (
        <a className="page-component__main__input__action-tx"
          href={
            "https://gnosis-chiado.blockscout.com/tx/" + waitForTransaction.data?.transactionHash
          }
        >
          View on Explorer
        </a>
      ) : null}
    </div>
  );
};

/** @notice Redeem shares */
export const RedeemShares: React.FC<{
  disabled: boolean;
  amount: BigNumber;
  receiver: string;
}> = ({ disabled, amount, receiver}) => {
  const { config } = usePrepareContractWrite({
    address: VAULT_ROUTER_ADDRESS,
    abi: RouterAbi,
    functionName: "redeem",
    args: [amount.toBigInt(), receiver],
  });
  const { write, data } = useContractWrite(config);
  const waitForTransaction = useWaitForTransaction({
    confirmations: 1,
    hash: data?.hash,
  });

  let runOnce = true;
  useEffect(() => {
    if (runOnce && waitForTransaction && waitForTransaction.isSuccess && amount) {
      console.log("great success!!");
      runOnce = false;
    }
  }, [waitForTransaction]);
  return (
    <div className="full-width">
      <div
        className="page-component__main__input__action-btn"
        onClick={() => {
          if (!disabled) write?.();
        }}
      >
      Redeem
      </div>
      {waitForTransaction.isSuccess ? (
        <a className="page-component__main__input__action-tx"
          href={
            "https://gnosis-chiado.blockscout.com/tx/" + waitForTransaction.data?.transactionHash
          }
        >
          View on Explorer
        </a>
      ) : null}
    </div>
  );
};

/** @notice Redeem shares */
export const RedeemSharesToNative: React.FC<{
  disabled: boolean;
  amount: BigNumber;
  receiver: string;
}> = ({ disabled, amount, receiver }) => {
  const { config, isSuccess } = usePrepareContractWrite({
    address: VAULT_ROUTER_ADDRESS,
    abi: RouterAbi,
    functionName: "redeemXDAI",
    args: [amount.toBigInt(), receiver],
  });
  const { write, data } = useContractWrite(config);
  const waitForTransaction = useWaitForTransaction({
    confirmations: 1,
    hash: data?.hash,
  });

    let runOnce = true;
  useEffect(() => {
    if (runOnce && waitForTransaction && waitForTransaction.isSuccess && amount) {
      console.log("great success!!");
      runOnce = false;
    }
  }, [waitForTransaction]);
  return (
    <div className="full-width">
      <div
        className="page-component__main__input__action-btn"
        onClick={() => {
          if (!disabled) write?.();
        }}
      >
      Redeem
      </div>
      {waitForTransaction.isSuccess ? (
        <a className="page-component__main__input__action-tx"
          href={
            "https://gnosis-chiado.blockscout.com/tx/" + waitForTransaction.data?.transactionHash
          }
        >
          View on Explorer
        </a>
      ) : null}
    </div>
  );
};

export const NoReceiver = () => {
  return <div className="page-component__main__input__action-btn">Add Receiver</div>;
};

/** @notice Convert shares */
export const useConvertToAssets = (shares: BigNumber) => {
  const res = useContractRead({
    address: ERC4626_VAULT_ADDRESS,
    abi: ERC4626Abi,
    functionName: "convertToAssets",
    args: [shares.toBigInt()],
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
    args: [deposits.toBigInt()],
  }).data;
  if (!res) {
    return "0";
  }
  return res.toString();
};
