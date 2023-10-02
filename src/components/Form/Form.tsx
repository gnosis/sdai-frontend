import React, { useMemo, useState } from "react";
import { useShallow } from "zustand/shallow";
import ActionButton from "../../components/ActionButton/ActionButton";
import "../../constants";
import { usePrepareContractWrite, useContractWrite, erc20ABI } from "wagmi";

import {
  ERC4626_VAULT_ADDRESS,
  RESERVE_TOKEN_ADDRESS,
  VAULT_ROUTER_ADDRESS,
} from "../../constants";

// ABIS
import { VaultAdapter } from "../../abis/VaultAdapter";

// Hooks
import { useReceiverData, useTotalSupply, useVaultAPY } from "../../hooks/useData";
import { TransactionReceipt } from "viem";
import { TokenInput } from "../TokenInput/TokenInput";
import { useAccountStore, useLoadedAccountStore } from "../../stores/account";
import { Token } from "../TokenSelector/TokenSelector";
import { bigIntMax, bigIntMin } from "../../utils/utils";

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
      withdrawAllowance: state.withdrawAllowance,
    })),
  );

  if (!account) {
    throw new Error("rendered without account");
  }

  // Token input
  const { address, depositAllowance, withdrawAllowance } = account;
  const [tokenInput, setTokenInput] = useState<{ token: Token; balance: bigint; max: bigint }>();
  const isNative = tokenInput?.token.name === "xDAI";
  const amount = tokenInput?.balance ?? 0n;

  // Toggles
  const [isDeposit, setIsDeposit] = useState<boolean>(true);
  const [receiver, setReceiver] = useState<`0x${string}`>(address ?? "0x");
  const myAddress = () => address && setReceiver(address);

  // Current action
  const action = useMemo(() => {
    if (isDeposit) {
      if (isNative) {
        return {
          name: "Deposit xDAI",
          action: Actions.DepositXDAI,
        };
      }

      if (amount > depositAllowance) {
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

    if (amount > withdrawAllowance) {
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
  }, [isDeposit, isNative, depositAllowance, withdrawAllowance, amount]);

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
      value: bigIntMin(amount, bigIntMax((tokenInput?.max ?? 0n) - GAS_PRICE_OFFSET, 0n)),
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
  // TODO: Move this to a global store
  const totalShares = useTotalSupply();
  const { dripRate, lastClaimTimestamp } = useReceiverData();
  const vaultAPY = useVaultAPY();

  // TODO: Not all of these need to be refetched constantly
  const refetch = () => {
    console.log("refetch?");

    totalShares.refetch();
    dripRate.refetch();
    lastClaimTimestamp.refetch();
    vaultAPY.refetch();

    // Update account store
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
        <div className={actionModalDisplay(true)} onClick={() => setIsDeposit(true)}>
          Deposit
        </div>
        <div className={actionModalDisplay(false)} onClick={() => setIsDeposit(false)}>
          Redeem
        </div>
      </div>

      <TokenInput
        onBalanceChange={(token, balance, max) => setTokenInput({ token, balance, max })}
        deposit={isDeposit}
      />

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
