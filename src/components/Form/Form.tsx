import React, { useMemo, useState } from "react";
import { useShallow } from "zustand/shallow";
import ActionButton from "../../components/ActionButton/ActionButton";
import "../../constants";
import { usePrepareContractWrite, useContractWrite, erc20ABI } from "wagmi";

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
  useVaultAPY,
} from "../../hooks/useData";
import { TransactionReceipt } from "viem";
import { TokenInput } from "../TokenInput/TokenInput";
import { useAccountStore, useLoadedAccountStore } from "../../stores/account";

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

const handled: Record<string, boolean> = {};
const Form: React.FC = () => {
  // Store
  const account = useLoadedAccountStore(
    useShallow(state => ({
      address: state.address,
      nativeBalance: state.nativeBalance,
      sharesBalance: state.sharesBalance,
      reservesBalance: state.reservesBalance,
      depositAllowance: state.depositAllowance,
      withdrawalAllowance: state.withdrawalAllowance,
    })),
  );

  if (!account) {
    console.log({ account });
    throw new Error("rendered without account");
  }

  // TODO: Improve this and specify defaults above
  const { address } = account;

  /** @notice Switches between deposit and redeem modal */
  const [isDeposit, setIsDeposit] = useState<boolean>(true);
  /** @notice Switches between xDAI and WXDAI */
  const [isNative, setNativeAsset] = useState<boolean>(true);

  // Deposit
  const [amount, setAmount] = useState<bigint>(ZERO);
  const [receiver, setReceiver] = useState<`0x${string}`>(address ?? "0x");
  const myAddress = () => address && setReceiver(address);

  // State
  const depositAllowance = useTokenAllowance(RESERVE_TOKEN_ADDRESS, address);
  const withdrawAllowance = useTokenAllowance(ERC4626_VAULT_ADDRESS, address);

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

    if (amount > (withdrawAllowance.data ?? BigInt(0))) {
      return {
        name: "Approve sDAI",
        action: Actions.ApproveSDAI,
      };
    }

    if (isNative) {
      return {
        name: "Withdraw XDAI",
        action: Actions.WithdrawXDAI,
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
  const vaultAPY = useVaultAPY();

  // TODO: Not all of these need to be refetched constantly
  const refetch = () => {
    console.log("refetch?");
    totalShares.refetch();
    dripRate.refetch();
    lastClaimTimestamp.refetch();
    depositAllowance.refetch();
    withdrawAllowance.refetch();
    vaultAPY.refetch();
    useAccountStore.getState().fetch();
  };

  const onSettled = (
    hash: `0x${string}`,
    data: TransactionReceipt | undefined,
    error: Error | null,
  ) => {
    // TODO: Handle this in the UI
    if (error) {
      throw error;
    }

    if (handled[hash] || !data) {
      return;
    }

    // Super hacky and not great
    handled[hash] = true;
    refetch();
  };

  if (!account) {
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

      <TokenInput onBalanceChange={console.log} />

      {/*
      <div className="page-component__main__action-modal-switch">
        <div
          className={actionModalSwitch(true)}
          onClick={() => setNativeAsset(true)}
        >
          xDAI
        </div>
        <div
          className={actionModalSwitch(false)}
          onClick={() => setNativeAsset(false)}
        >
          WXDAI
        </div>
      </div>
      <div className="page-component__main__asset__margin">
        <div className="page-component__main__asset">
          <img
            className="page-component__main__asset__img"
            src={wxdaiLogo}
            alt={"WXDAI"}
          />
          <div className="page-component__main__input">
            <input
              type="number"
              min="0"
              placeholder="0.00"
              step="0.01"
              autoComplete="off"
              onChange={(e) => setAmount(parseUnits(e.target.value || "0", 18))}
              value={amount ? +formatUnits(amount.toString()) : ""}
            />
            <div
              className="page-component__main__input__max-btn"
              onClick={() => {
                if (isDeposit)
                  if (!isNative) {
                    assetBalance.data && setAmount(assetBalance.data.value);
                  } else {
                    nativeBalance.data &&
                      setAmount(nativeBalance.data.value - GAS_PRICE_OFFSET);
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
          <img
            className="page-component__main__asset__img"
            src={sDaiLogo}
            alt="sDAI"
          />
          <div className="page-component__main__input">
            <Input amount={amount} />
          </div>
        </div>
      </div>
      */}

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
              onChange={e => e.target.value && setReceiver(e.target.value as `0x${string}`)}
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
          onSettled={onSettled}
        />
      </div>
    </div>
  );
};

export default Form;
