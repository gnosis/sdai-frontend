import React, { useContext, useState, useEffect, useRef, KeyboardEvent } from "react";
import ethers from "ethers";
import { formatWei, VaultState, FormState } from "../../utils/utils";
import { chains } from "../../constants";
import {
  usePrepareContractWrite,
  useContractWrite,
  useBalance,
  useContractRead,
  useWaitForTransaction,
  useAccount,
} from "wagmi";

// ABIS
import ERC20Abi from "../../abis/MyVaultTokenERC20.json";
import ERC4626Abi from "../../abis/MyVaultTokenERC4626.json";
import AdapterAbi from "../../abis/VaultAdapter.json";
import ReceiverAbi from "../../abis/BridgeReceiver.json";

interface IActionButtonProps {
    method:string;
    mutationTrigger:(() => void) | undefined;
    mutationData:any;
}

const ADAPTER: `0x${string}` = "0x0EA5928162b0F74BAEf31c00A04A4cEC5Fe9f4b2";
const RCV: `0x${string}` = "0x071bf5695afeda65c405794c6574ae63ca8b73c3";
const WXDAI: `0x${string}` = "0x18c8a7ec7897177E4529065a7E7B0878358B3BfF";
const VAULT: `0x${string}` = "0x20e5eB701E8d711D419D444814308f8c2243461F";

const ActionButton: React.FC<IActionButtonProps> = ({
  method,
  mutationTrigger,
  mutationData,
}) => {
  const { address } = useAccount();


  const waitForTransaction = useWaitForTransaction({
    confirmations: 1,
    hash: mutationData?.hash,
  });

  return (
   // <div className="full-width">
      <div
        className="page-component__main__input__action-btn"
        onClick={() => {
            mutationTrigger?.();
        }}
      >
        {method}
      </div>
  //  </div>
  );
};

export default ActionButton;
