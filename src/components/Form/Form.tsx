import React, { useContext, useState, useEffect, useRef, KeyboardEvent } from "react";
import { ethers } from "ethers";
import { formatWeiComma, formatWei, VaultState, FormState } from "../../utils/utils";
import Input from "../../components/Input/Input";
import ActionButton from "../../components/ActionButton/ActionButton";
import "../../constants";

import {
    usePrepareContractWrite,
    useContractWrite,
  } from "wagmi";

import sDaiLogo from "../../assets/Savings-xDAI.svg";
import wxdaiLogo from "../../assets/xdai.png";
import { ZERO } from "../../constants";

// ABIS
import ERC20Abi from "../../abis/MyVaultTokenERC20.json";
import ERC4626Abi from "../../abis/MyVaultTokenERC4626.json";
import AdapterAbi from "../../abis/VaultAdapter.json";
import ReceiverAbi from "../../abis/BridgeReceiver.json";

const ADAPTER: `0x${string}` = "0x0EA5928162b0F74BAEf31c00A04A4cEC5Fe9f4b2";
const RCV: `0x${string}` = "0x071bf5695afeda65c405794c6574ae63ca8b73c3";
const WXDAI: `0x${string}` = "0x18c8a7ec7897177E4529065a7E7B0878358B3BfF";
const VAULT: `0x${string}` = "0x20e5eB701E8d711D419D444814308f8c2243461F";

interface IFormProps {
  currentUser: `0x${string}`;
  vaultState: VaultState;
  setVaultState: React.Dispatch<React.SetStateAction<VaultState>>;
}

const Form: React.FC<IFormProps> = ({ currentUser, vaultState, setVaultState }) => {
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
  const [assetAmount, setAssetAmount] = useState<BigInt>(ZERO);
  /** @notice Sets the receiver address for deposits/withdrawals */
  const [actionReceiver, setActionReceiver] = useState<`0x${string}`>(currentUser);

  // Withdrawal
  /** @notice Sets shares amount to redeem */
  const [sharesAmount, setSharesAmount] = useState<BigInt>(ZERO);

  const [formState, setFormState] = useState<FormState>({
    assetAmount: assetAmount,
    sharesAmount: sharesAmount,
    actionReceiver: actionReceiver,
  });

  /** @notice quick account */
  const myAddress = (e: any) => {
    if (currentUser) {
      e.currentTarget.previousSibling.value = currentUser;
      setActionReceiver(currentUser);
    }
  };

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

   const approveDeposit = useContractWrite(
     usePrepareContractWrite({
       address: WXDAI,
       abi: ERC20Abi,
       functionName: "approve",
       args: [ADAPTER, formState.assetAmount],
     }).config,
   );
 
   const depositXDAI = useContractWrite(
     usePrepareContractWrite({
       address: ADAPTER,
       abi: AdapterAbi,
       functionName: "depositXDAI",
       args: [formState.actionReceiver],
       value: formState.assetAmount.valueOf(),
     }).config,
   );
 
   const depositWXDAI = useContractWrite(
     usePrepareContractWrite({
       address: ADAPTER,
       abi: AdapterAbi,
       functionName: "deposit",
       args: [formState.assetAmount, formState.actionReceiver],
     }).config,
   );
 
   const approveWithdraw = useContractWrite(
     usePrepareContractWrite({
       address: VAULT,
       abi: ERC20Abi,
       functionName: "approve",
       args: [ADAPTER, formState.sharesAmount],
     }).config,
   );
 
   const redeemXDAI = useContractWrite(
     usePrepareContractWrite({
       address: ADAPTER,
       abi: AdapterAbi,
       functionName: "redeemXDAI",
       args: [formState.sharesAmount, formState.actionReceiver],
     }).config,
   );
 
   const redeemWXDAI = useContractWrite(
     usePrepareContractWrite({
       address: ADAPTER,
       abi: AdapterAbi,
       functionName: "redeem",
       args: [formState.actionReceiver],
     }).config,
   );
 
   const withdrawXDAI = useContractWrite(
     usePrepareContractWrite({
       address: ADAPTER,
       abi: AdapterAbi,
       functionName: "withdrawXDAI",
       args: [formState.sharesAmount, formState.actionReceiver],
     }).config,
   );
 
   const withdrawWXDAI = useContractWrite(
     usePrepareContractWrite({
       address: ADAPTER,
       abi: AdapterAbi,
       functionName: "withdraw",
       args: [formState.actionReceiver],
     }).config,
   );

   
   const [method, setMethod] = useState<string>("Deposit");
   const [mutationTrigger, setTrigger] = useState<(() => void | undefined)>();
   const [mutationData, setData] = useState<any>();
 
   function selectMyMethod(
     isDeposit: boolean,
     isNative: boolean,
     form: FormState,
     vault: VaultState,
   ) {
     // DEPOSITS
     if (isDeposit) {
       if (isNative) {
         setMethod("Deposit xDAI");
         const{ write, data } = depositXDAI;
         setTrigger(write);
         setData(data);
       } else {
         if (form.assetAmount > vault.depositAllowance) {
           setMethod("Approve WXDAI");
           const{ write, data } = approveDeposit;
           setTrigger(write);
           setData(data);
         } else {
           setMethod("Deposit WXDAI");
           const{ write, data } = depositWXDAI;
           setTrigger(write);
           setData(data);
         }
       }
     }
     // WITHDRAWALS
     else {
       if (form.sharesAmount > vault.withdrawAllowance) {
         setMethod("Approve sDAI");
         const{ write, data } = approveWithdraw;
         setTrigger(write);
         setData(data);
       } else {
         if (isNative) {
           setMethod("Withdraw xDAI");
           const{ write, data } = redeemXDAI;
           setTrigger(write);
           setData(data);
         } else {
           setMethod("Withdraw WXDAI");
           const{ write, data } = redeemWXDAI;
           setTrigger(write);
           setData(data);
         }
       }
     }
   }

   useEffect(() => {
    selectMyMethod(isDeposit, isNative, formState, vaultState);

  }, [isDeposit, isNative, formState, vaultState]);

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
          {" "}
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
          {" "}
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
                if (e.target.value) setAssetAmount(ethers.parseUnits(e.target.value, 18));
              }}
              onKeyDown={(event: KeyboardEvent) => removeScroll(event)}
              autoComplete="off"
              ref={amountRef}
            />
            <div
              className="page-component__main__input__max-btn"
              onClick={() => {
                if (!isNative) {
                  if (amountRef.current && vaultState.assetBalance) {
                    amountRef.current.value = formatWei(vaultState.assetBalance);

                    setAssetAmount(vaultState.assetBalance);
                  }
                } else {
                  if (amountRef.current && vaultState.XDAIBalance) {
                    amountRef.current.value = formatWei(vaultState.XDAIBalance);

                    setAssetAmount(vaultState.XDAIBalance.valueOf() - BigInt("10000000000000000"));
                  }
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
            <Input assets={assetAmount} shares={sharesAmount} deposit={isDeposit} />
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
                if (e.target.value) setActionReceiver(e.target.value);
              }}
              onKeyDown={e => removeScroll(e)}
              autoComplete="off"
              ref={receiverRef}
            />
            <div
              className="page-component__main__input__max-btn"
              onClick={(e: any) => myAddress(e)}
            >
              ME
            </div>
          </div>
        </div>
      </div>
      <div>&nbsp;</div>
      <div className="page-component__main__input__btns">
        {formState ? (
          <ActionButton
            method={method}
            mutationTrigger={mutationTrigger} 
            mutationData={mutationData}
          />
        ) : null}
      </div>
    </div>
  );
};

export default Form;
