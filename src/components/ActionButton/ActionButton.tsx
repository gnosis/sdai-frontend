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
    <button
      className="border rounded-md w-full bg-[#DD7143] hover:border-[#DD7143] active:opacity-90 p-4 my-1 text-[#fff] text-center font-semibold text-xl "
      onClick={() => mutationTrigger?.()}
    >
      {method}
    </button>
    //  </div>
  );
};

export default ActionButton;
