import React, { useEffect } from "react";
import { TransactionReceipt } from "viem";
import { useWaitForTransaction } from "wagmi";
import { WriteContractResult } from "wagmi/actions";

interface IActionButtonProps {
  method: string;
  mutationData?: WriteContractResult;
  mutationTrigger?: () => void;

  // TODO: Import this type? Define it dynamically somehow?
  onSettled?: (
    hash: `0x${string}`,
    data: TransactionReceipt | undefined,
    error: Error | null
  ) => void;
}

const ActionButton: React.FC<IActionButtonProps> = ({
  method,
  mutationTrigger,
  mutationData,
  onSettled,
}) => {
  const { data, error } = useWaitForTransaction({
    confirmations: 1,
    hash: mutationData?.hash,
  });

  useEffect(
    () => mutationData?.hash && onSettled?.(mutationData.hash, data, error),
    [onSettled, mutationData?.hash, data, error]
  );

  return (
    // <div className="full-width">
    <div
      className="page-component__main__input__action-btn"
      onClick={() => mutationTrigger?.()}
    >
      {method}
    </div>
    //  </div>
  );
};

export default ActionButton;
