import React, { useState, KeyboardEvent, useMemo } from "react";
import { ethers } from "ethers";
import Input from "../../components/Input/Input";
import ActionButton from "../../components/ActionButton/ActionButton";
import "../../constants";
import { usePrepareContractWrite, useContractWrite, erc20ABI, useBalance, useAccount } from "wagmi";

import sDaiLogo from "../../assets/Savings-xDAI.svg";
import wxdaiLogo from "../../assets/xdai.png";
import {
  ERC4626_VAULT_ADDRESS,
  RESERVE_TOKEN_ADDRESS,
  VAULT_ROUTER_ADDRESS,
  ZERO,
} from "../../constants";

// ABIS
import { VaultAdapter } from "../../abis/VaultAdapter";

// Hooks
import {
  useReceiverData,
  useTokenAllowance,
  useTotalSupply,
  useUserReservesBalance,
} from "../../hooks/useData";

// Constants
const GAS_PRICE_OFFSET = BigInt("10000000000000000");

enum Actions {
  DepositXDAI,
  ApproveWXDAI,
  DepositWXDAI,
  ApproveSDAI,
  RedeemXDAI,
  WithdrawWXDAI,
  WithdrawXDAI,
}

const Form: React.FC = () => {
  const { address } = useAccount();

  /** @notice Switches between deposit and redeem modal */
  const [isDeposit, setIsDeposit] = useState<boolean>(true);
  /** @notice Switches between xDAI and WXDAI */
  const [isNative, setNativeAsset] = useState<boolean>(true);

  // Deposit
  /** @notice Sets asset deposit amount */
  const [amount, setAmount] = useState<bigint>(ZERO);
  /** @notice Sets the receiver address for deposits/withdrawals */
  const [receiver, setReceiver] = useState<`0x${string}`>(address ?? "0x");

  // State
  const assetBalance = useBalance({ token: RESERVE_TOKEN_ADDRESS, address });

  const sharesBalance = useBalance({ token: ERC4626_VAULT_ADDRESS, address });

  /** @notice quick account */
  const myAddress = () => address && setReceiver(address);

  /** @notice remove the annoying scroll of numbers when press keypad */
  const removeScroll = (e: KeyboardEvent) => {
    if (["Space", "ArrowUp", "ArrowDown"].indexOf(e.code) > -1) {
      e.preventDefault();
    }
  };

  // State
  const depositAllowance = useTokenAllowance(RESERVE_TOKEN_ADDRESS, address);
  const withdrawAllowance = useTokenAllowance(ERC4626_VAULT_ADDRESS, address);
  const nativeBalance = useBalance({ address });
  const reservesBalance = useUserReservesBalance(address);

  // Current action
  const action = useMemo(() => {
    if (isDeposit) {
      if (isNative) {
        return {
          name: "Deposit xDAI",
          action: Actions.DepositXDAI,
        };
      }

      if (amount > (depositAllowance.data ?? BigInt(0))) {
        return {
          name: "Approve WXDAI",
          action: Actions.ApproveWXDAI,
        };
      }

      return {
        name: "Deposit WXDAI",
        action: Actions.DepositWXDAI,
      };
    }

    if (isNative) {
      return {
        name: "Withdraw XDAI",
        action: Actions.WithdrawXDAI,
      };
    }

    if (amount > (withdrawAllowance.data ?? BigInt(0))) {
      return {
        name: "Approve sDAI",
        action: Actions.ApproveSDAI,
      };
    }

    return {
      name: "Withdraw WXDAI",
      action: Actions.WithdrawWXDAI,
    };
    /*
    return {
      name: "Redeem xDAI",
      action: Actions.RedeemXDAI,
    };*/
  }, [isDeposit, isNative, depositAllowance.data, withdrawAllowance.data, amount]);

  const approveWXDAI = useContractWrite(
    usePrepareContractWrite({
      address: RESERVE_TOKEN_ADDRESS,
      abi: erc20ABI,
      functionName: "approve",
      args: [VAULT_ROUTER_ADDRESS, amount],
      enabled: action.action === Actions.ApproveWXDAI,
    }).config,
  );

  const depositXDAI = useContractWrite(
    usePrepareContractWrite({
      address: VAULT_ROUTER_ADDRESS,
      abi: VaultAdapter,
      functionName: "depositXDAI",
      args: [receiver],
      value: amount,
      enabled: action.action === Actions.DepositXDAI,
    }).config,
  );

  const depositWXDAI = useContractWrite(
    usePrepareContractWrite({
      address: VAULT_ROUTER_ADDRESS,
      abi: VaultAdapter,
      functionName: "deposit",
      args: [amount, receiver],
      enabled: action.action === Actions.DepositWXDAI,
    }).config,
  );

  const approveSDAI = useContractWrite(
    usePrepareContractWrite({
      address: ERC4626_VAULT_ADDRESS,
      abi: erc20ABI,
      functionName: "approve",
      args: [VAULT_ROUTER_ADDRESS, amount],
      enabled: action.action === Actions.ApproveSDAI,
    }).config,
  );

  const redeemXDAI = useContractWrite(
    usePrepareContractWrite({
      address: VAULT_ROUTER_ADDRESS,
      abi: VaultAdapter,
      functionName: "redeemXDAI",
      args: [amount, receiver],
      enabled: action.action === Actions.RedeemXDAI,
    }).config,
  );

  const withdrawWXDAI = useContractWrite(
    usePrepareContractWrite({
      address: VAULT_ROUTER_ADDRESS,
      abi: VaultAdapter,
      functionName: "withdraw",
      args: [amount, receiver],
      enabled: action.action === Actions.WithdrawWXDAI,
    }).config,
  );

  const withdrawXDAI = useContractWrite(
    usePrepareContractWrite({
      address: VAULT_ROUTER_ADDRESS,
      abi: VaultAdapter,
      functionName: "withdrawXDAI",
      args: [amount, receiver],
      enabled: action.action === Actions.WithdrawXDAI,
    }).config,
  );

  // Store update
  // TODO: Move this up
  const totalShares = useTotalSupply();
  const { dripRate, lastClaimTimestamp } = useReceiverData();

  const refetch = () => {
    totalShares.refetch();
    dripRate.refetch();
    lastClaimTimestamp.refetch();
    sharesBalance.refetch();
    reservesBalance.refetch();
  };

  if (depositAllowance.isFetching || withdrawAllowance.isFetching || nativeBalance.isFetching) {
    return <p>Loading...</p>;
  }

  const method = {
    [Actions.DepositXDAI]: depositXDAI,
    [Actions.ApproveWXDAI]: approveWXDAI,
    [Actions.DepositWXDAI]: depositWXDAI,
    [Actions.ApproveSDAI]: approveSDAI,
    [Actions.RedeemXDAI]: redeemXDAI,
    [Actions.WithdrawWXDAI]: withdrawWXDAI,
    [Actions.WithdrawXDAI]: withdrawXDAI,
  }[action.action];

  const actionModalDisplay = (deposit: boolean) =>
    `page-component__main__action-modal-display__item${deposit === isDeposit ? "__action" : ""}`;

  const actionModalSwitch = (native: boolean) =>
    `page-component__main__action-modal-switch__asset${native === isNative ? "__action" : ""}`;

  return (
    <div className="page-component__main__form">
      <div className="page-component__main__action-modal-display">
        <div
          className={actionModalDisplay(true)}
          onClick={() => {
            setIsDeposit(true);
            setAmount(ZERO);
          }}
        >
          Deposit
        </div>
        <div
          className={actionModalDisplay(false)}
          onClick={() => {
            setIsDeposit(false);
            setAmount(ZERO);
          }}
        >
          Redeem
        </div>
      </div>
      <div className="page-component__main__action-modal-switch">
        <div className={actionModalSwitch(true)} onClick={() => setNativeAsset(true)}>
          xDAI
        </div>
        <div className={actionModalSwitch(false)} onClick={() => setNativeAsset(false)}>
          WXDAI
        </div>
      </div>
      <div className="page-component__main__asset__margin">
        <div className="page-component__main__asset">
          <img className="page-component__main__asset__img" src={wxdaiLogo} alt={"WXDAI"} />
          <div className="page-component__main__input">
            <input
              type="number"
              min="0"
              placeholder="0.00"
              step="0.01"
              autoComplete="off"
              onChange={(e: any) => setAmount(ethers.parseUnits(e.target.value || "0", 18))}
              value={amount ? +ethers.formatUnits(amount.toString()) : ""}
            />
            <div
              className="page-component__main__input__max-btn"
              onClick={() => {
                if (isDeposit)
                  if (!isNative) {
                    assetBalance.data && setAmount(assetBalance.data.value);
                  } else {
                    nativeBalance.data && setAmount(nativeBalance.data.value - GAS_PRICE_OFFSET);
                  }
                else {
                  reservesBalance.data && setAmount(reservesBalance.data);
                }
              }}
            >
              MAX
            </div>
          </div>
        </div>
        <div className="page-component__main__asset">
          <img className="page-component__main__asset__img" src={sDaiLogo} alt="sDAI" />
          <div className="page-component__main__input">
            <Input amount={amount} />
          </div>
        </div>
      </div>
      <div className="page-component__main__asset__margin">
        <div className="page-component__main__receiver">
          <div className="page-component__main__receiver__title">
            <p>Receiving address</p>
          </div>
          <div className="page-component__main__input__receiver">
            <input
              className="page-component__main__input__receiver_inputBox"
              type="text"
              placeholder="0x124...5678"
              onChange={(e: any) => {
                if (e.target.value) setReceiver(e.target.value);
              }}
              onKeyDown={e => removeScroll(e)}
              autoComplete="off"
              value={receiver}
            />
            <div className="page-component__main__input__receiver__btn" onClick={myAddress}>
              ME
            </div>
          </div>
        </div>
      </div>
      <div>&nbsp;</div>
      <div className="page-component__main__input__btns">
        <ActionButton
          method={action.name}
          mutationTrigger={method.write}
          mutationData={method.data}
          onSettled={(data, error) => {
            if (!data) {
              return;
            }

            // TODO: Handle this in the UI
            if (error) {
              throw error;
            }

            refetch();
          }}
        />
      </div>
    </div>
  );
};

export default Form;
