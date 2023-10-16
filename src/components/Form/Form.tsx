import React, { useMemo, useState } from "react";
import { useShallow } from "zustand/shallow";
import ActionButton from "../../components/ActionButton/ActionButton";
import AddToken from "../../components/AddToken/AddToken";
import TransactionOverview from "../../components/TransactionOverview/TransactionOverview";
import ContractsOverview from "../../components/ContractsOverview/ContractsOverview";
import { usePrepareContractWrite, useContractWrite, erc20ABI, erc4626ABI } from "wagmi";

import { MAX_UINT256 } from "../../constants";

// ABIS
import { VaultAdapter } from "../../abis/VaultAdapter";

// Hooks
import { useReceiverData, useTotalSupply, useVaultAPY } from "../../hooks/useData";
import { TransactionReceipt } from "viem";
import { TokenInput } from "../TokenInput/TokenInput";
import { useAccountStore, useLoadedAccountStore } from "../../stores/account";
import { Token } from "../TokenSelector/TokenSelector";
import { bigIntMax, bigIntMin } from "../../utils/utils";
import { useLoadedChainStore } from "../../stores/chain";

// Constants
const GAS_PRICE_OFFSET = 10000000000000000n;

enum Actions {
  DepositXDAI,
  ApproveWXDAI,
  DepositWXDAI,
  ApproveSDAI,
  WithdrawWXDAI,
  WithdrawXDAI,
  WithdrawFromVault,
}

const handled: Record<string, boolean> = {};
const Form: React.FC = () => {
  // Store
  const { addresses } = useLoadedChainStore(useShallow(({ addresses }) => ({ addresses })));
  const account = useLoadedAccountStore(
    useShallow(state => ({
      address: state.address,
      sharesBalance: state.sharesBalance,
      depositAllowance: state.depositAllowance,
      withdrawAllowance: state.withdrawAllowance,
    })),
    true,
  );

  // Token input
  const { address, depositAllowance, withdrawAllowance, sharesBalance } = account;
  const [tokenInput, setTokenInput] = useState<{
    token: Token;
    balance: bigint;
    max: bigint;
    shares: bigint;
  }>();
  const isNative = tokenInput?.token.name === "xDAI";
  const amount = tokenInput?.balance ?? 0n;
  const amountIsMax = tokenInput?.balance === tokenInput?.max;
  const sharesAmount = tokenInput?.shares ?? 0n;

  // Toggles
  const [isDeposit, setIsDeposit] = useState<boolean>(true);
  const [receiver, setReceiver] = useState<`0x${string}`>(address ?? "0xNOT_AN_ADDRESS");
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

    if (sharesAmount > withdrawAllowance) {
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

    if (addresses.vaultAdapter === addresses.vault) {
      return {
        name: "Withdraw WXDAI From Vault",
        action: Actions.WithdrawFromVault,
      };
    }

    return {
      name: "Withdraw WXDAI",
      action: Actions.WithdrawWXDAI,
    };
  }, [isDeposit, isNative, depositAllowance, withdrawAllowance, amount, sharesAmount, addresses]);

  const approveWXDAI = useContractWrite(
    usePrepareContractWrite({
      address: addresses.reserveToken,
      abi: erc20ABI,
      functionName: "approve",
      args: [addresses.vaultAdapter, amount],
      enabled: action.action === Actions.ApproveWXDAI,
    }).config,
  );

  const depositXDAI = useContractWrite(
    usePrepareContractWrite({
      address: addresses.vaultAdapter,
      abi: VaultAdapter,
      functionName: "depositXDAI",
      args: [receiver],
      value: bigIntMin(amount, bigIntMax((tokenInput?.max ?? 0n) - GAS_PRICE_OFFSET, 0n)),
      enabled: action.action === Actions.DepositXDAI,
    }).config,
  );

  const depositWXDAI = useContractWrite(
    usePrepareContractWrite({
      address: addresses.vaultAdapter,
      abi: VaultAdapter,
      functionName: "deposit",
      args: [amount, receiver],
      enabled: action.action === Actions.DepositWXDAI,
    }).config,
  );

  const approveSDAI = useContractWrite(
    usePrepareContractWrite({
      address: addresses.vault,
      abi: erc20ABI,
      functionName: "approve",
      args: [addresses.vaultAdapter, MAX_UINT256],
      enabled: action.action === Actions.ApproveSDAI,
    }).config,
  );

  const withdrawWXDAI = useContractWrite(
    usePrepareContractWrite({
      address: addresses.vaultAdapter,
      abi: VaultAdapter,
      functionName: amountIsMax ? "redeem" : "withdraw",
      args: [amountIsMax ? sharesBalance.value : amount, receiver],
      enabled: action.action === Actions.WithdrawWXDAI,
    }).config,
  );

  const withdrawXDAI = useContractWrite(
    usePrepareContractWrite({
      address: addresses.vaultAdapter,
      abi: VaultAdapter,
      functionName: amountIsMax ? "redeemXDAI" : "withdrawXDAI",
      args: [amountIsMax ? sharesBalance.value : amount, receiver],
      enabled: action.action === Actions.WithdrawXDAI,
    }).config,
  );

  const WithdrawFromVault = useContractWrite(
    usePrepareContractWrite({
      address: addresses.vault,
      abi: erc4626ABI,
      functionName: amountIsMax ? "redeem" : "withdraw",
      args: [amountIsMax ? sharesBalance.value : amount, receiver, receiver],
      enabled: action.action === Actions.WithdrawFromVault,
    }).config,
  );

  // Store update
  // TODO: Move this to a global store
  const totalShares = useTotalSupply();
  const { dripRate, lastClaimTimestamp } = useReceiverData();
  const vaultAPY = useVaultAPY();

  // TODO: Not all of these need to be refetched constantly
  const refetch = () => {
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
    [Actions.WithdrawWXDAI]: withdrawWXDAI,
    [Actions.WithdrawXDAI]: withdrawXDAI,
    [Actions.WithdrawFromVault]: WithdrawFromVault,
  }[action.action];

  const actionModalDisplay = (deposit: boolean) =>
    `page-component__main__action-modal-display__item${deposit === isDeposit ? "__action" : ""}`;

  return (
    <div className="m-auto flex flex-col content-center py-10 gap-10 sm:flex-row">
      <div className="flex flex-col gap-5 rounded-lg w-full sm:w-3/5">
        <div className="page-component__main__action-modal-display">
          <div className={actionModalDisplay(true)} onClick={() => setIsDeposit(true)}>
            Deposit
          </div>
          <div className={actionModalDisplay(false)} onClick={() => setIsDeposit(false)}>
            Withdraw
          </div>
        </div>

        <TokenInput
          onBalanceChange={(token, balance, max, shares) =>
            setTokenInput({ token, balance, max, shares })
          }
          deposit={isDeposit}
        />

        <div className="page-component__main__asset__margin my-1">
          <div className="page-component__main__receiver">
            <div className="px-2 text-[#45433C] text-l font-medium">
              <p>Receiving address</p>
            </div>
            <div className="flex flex-row flex-grow items-center rounded-xl border border-[#DDDAD0] bg-white py-3 px-5 h-14">
              <div className="w-full">
                <input
                  className="h-full text-[#45433C] text-xl"
                  type="text"
                  placeholder="0x124...5678"
                  onChange={e => e.target.value && setReceiver(e.target.value as `0x${string}`)}
                  autoComplete="off"
                  value={receiver}
                />
              </div>
              <button
                className="h-full font-bold ml-2 text-sm text-[#7A776D] text-center"
                onClick={myAddress}
              >
                Me
              </button>
            </div>
          </div>
        </div>
        <div className="page-component__main__input__btns">
          <ActionButton
            method={action.name}
            mutationTrigger={method.write}
            mutationData={method.data}
            onSettled={onSettled}
          />
        </div>

        <AddToken />
      </div>

      <div className="flex flex-col rounded-lg gap-2 w-full sm:w-3/5 ">
        <TransactionOverview tokenInput={tokenInput} isDeposit={isDeposit} />
        <ContractsOverview />
      </div>
    </div>
  );
};

export default Form;
