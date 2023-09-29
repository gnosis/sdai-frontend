import React, { useState, useRef, KeyboardEvent, useMemo } from "react";
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
import { useTokenAllowance } from "../../hooks/useData";

// Constants
const GAS_PRICE_OFFSET = BigInt("10000000000000000");

enum Actions {
  DepositXDAI,
  ApproveWXDAI,
  DepositWXDAI,
  ApproveSDAI,
  RedeemXDAI,
  withdrawWXDAI,
}

const Form: React.FC = () => {
  const { address } = useAccount();

  /** @notice Switches between deposit and redeem modal */
  const [isDeposit, setIsDeposit] = useState<boolean>(true);
  /** @notice Switches between xDAI and WXDAI */
  const [isNative, setNativeAsset] = useState<boolean>(true);

  /** @notice Deposit/Withdrawal amount input */
  const amountRef = useRef<HTMLInputElement>(null);
  /** @notice Deposit/Withdrawal address input */
  const receiverRef = useRef<HTMLInputElement>(null);

  // Deposit
  /** @notice Sets asset deposit amount */
  const [amount, setAmount] = useState<bigint>(ZERO);
  /** @notice Sets the receiver address for deposits/withdrawals */
  const [receiver, setReceiver] = useState<`0x${string}`>(address ?? "0x");

  // State
  const assetBalance = useBalance({ token: RESERVE_TOKEN_ADDRESS, address });

  /** @notice quick account */
  const myAddress = () => address && setReceiver(address);

  /** @notice Swap between deposit/redeem modal */
  const swapModal = () => {
    setIsDeposit(() => !isDeposit);
    clearRefs();
  };

  /** @notice Swap between xdai/wxdai asset */
  const swapAsset = () => {
    setNativeAsset(() => !isNative);
    clearRefs();
  };

  /** @notice remove the annoying scroll of numbers when press keypad */
  const removeScroll = (e: KeyboardEvent) => {
    if (["Space", "ArrowUp", "ArrowDown"].indexOf(e.code) > -1) {
      e.preventDefault();
    }
  };

  const clearRefs = () => {
    if (amountRef.current) amountRef.current.value = "";
    if (receiverRef.current) receiverRef.current.value = "";
  };

  // State
  const depositAllowance = useTokenAllowance(RESERVE_TOKEN_ADDRESS, address);
  const withdrawAllowance = useTokenAllowance(ERC4626_VAULT_ADDRESS, address);
  const nativeBalance = useBalance({ address });

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
        name: "Withdraw xDAI",
        action: Actions.RedeemXDAI,
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
      action: Actions.withdrawWXDAI,
    };
  }, [isDeposit, isNative, depositAllowance.data, withdrawAllowance.data]);

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
      enabled: action.action === Actions.withdrawWXDAI,
    }).config,
  );

  if (depositAllowance.isFetching || withdrawAllowance.isFetching || nativeBalance.isFetching) {
    return <p>Loading...</p>;
  }

  const method = {
    [Actions.DepositXDAI]: depositXDAI,
    [Actions.ApproveWXDAI]: approveWXDAI,
    [Actions.DepositWXDAI]: depositWXDAI,
    [Actions.RedeemXDAI]: redeemXDAI,
    [Actions.ApproveSDAI]: approveSDAI,
    [Actions.withdrawWXDAI]: withdrawWXDAI,
  }[action.action];

  return (
    <div className="page-component__main__form">
      <div className="page-component__main__action-modal-display">
        {isDeposit ? (
          <div className="page-component__main__action-modal-display__item__action"> Deposit </div>
        ) : (
          <div
            className="page-component__main__action-modal-display__item"
            onClick={() => swapModal()}
          >
            Deposit
          </div>
        )}
        {!isDeposit ? (
          <div className="page-component__main__action-modal-display__item__action"> Redeem </div>
        ) : (
          <div
            className="page-component__main__action-modal-display__item"
            onClick={() => swapModal()}
          >
            Redeem
          </div>
        )}
      </div>
      <div className="page-component__main__action-modal-switch">
        {isNative ? (
          <div className="page-component__main__action-modal-switch__asset__action">xDAI</div>
        ) : (
          <div
            className="page-component__main__action-modal-switch__asset"
            onClick={() => swapAsset()}
          >
            xDAI
          </div>
        )}
        {isNative ? (
          <div
            className="page-component__main__action-modal-switch__asset"
            onClick={() => swapAsset()}
          >
            WXDAI
          </div>
        ) : (
          <div className="page-component__main__action-modal-switch__asset__action">WXDAI</div>
        )}
      </div>
      <div className="page-component__main__asset__margin">
        <div className="page-component__main__asset">
          <img
            className="page-component__main__asset__img"
            src={isDeposit ? wxdaiLogo : sDaiLogo}
            alt={isDeposit ? "WXDAI" : "sDAI"}
          />
          <div className="page-component__main__input">
            <input
              type="number"
              min="0"
              placeholder="0.0"
              onChange={(e: any) => {
                if (e.target.value) setAmount(ethers.parseUnits(e.target.value, 18));
              }}
              onKeyDown={(event: KeyboardEvent) => removeScroll(event)}
              autoComplete="off"
            />
            <div
              className="page-component__main__input__max-btn"
              onClick={() => {
                if (!isNative) {
                  assetBalance.data && setAmount(assetBalance.data.value);
                } else {
                  nativeBalance.data && setAmount(nativeBalance.data.value - GAS_PRICE_OFFSET);
                }
              }}
            >
              MAX
            </div>
          </div>
        </div>
        <div className="page-component__main__asset">
          <img
            className="page-component__main__asset__img"
            src={!isDeposit ? wxdaiLogo : sDaiLogo}
            alt={!isDeposit ? "WXDAI" : "sDAI"}
          />
          <div className="page-component__main__input">
            <Input amount={amount} deposit={isDeposit} />
          </div>
        </div>
      </div>
      <div className="page-component__main__asset__margin">
        <div className="page-component__main__asset">
          <div className="page-component__main__actions">
            <p>Receiver</p>
          </div>
          <div className="page-component__main__input">
            <input
              type="text"
              placeholder="0x124...5678"
              onChange={(e: any) => {
                if (e.target.value) setReceiver(e.target.value);
              }}
              onKeyDown={e => removeScroll(e)}
              autoComplete="off"
              ref={receiverRef}
            />
            <div className="page-component__main__input__max-btn" onClick={myAddress}>
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
        />
      </div>
    </div>
  );
};

export default Form;
