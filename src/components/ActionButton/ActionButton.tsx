import React, { useEffect } from "react";
import { TransactionReceipt } from "viem";
import { useWaitForTransaction } from "wagmi";
import { disconnect, WriteContractResult } from "wagmi/actions";
import { toast } from 'react-toastify';
import { SDAI_API_URL } from "../../constants";
import { useLoadingStore } from "../../stores/loading";

interface IActionButtonProps {
  method: string;
  mutationData?: WriteContractResult;
  mutationTrigger?: () => void;
  isDenied: boolean;
  addressToAnalyze?: `0x${string}` | null

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
  isDenied,
  addressToAnalyze
}) => {

  const { set: setLoading } = useLoadingStore()

  if (!isDenied) {
    const { data, error } = useWaitForTransaction({
      confirmations: 1,
      hash: mutationData?.hash,
    });
    useEffect(
      () => mutationData?.hash && onSettled?.(mutationData.hash, data, error),
      [onSettled, mutationData?.hash, data, error]
    );
  }

  const handleClick = async () => {
    setLoading(true);

    if (isDenied) {
      toast.error('Action failed');
      console.error('Action failed, is denied');
      setLoading(false);
      return;
    }

    if (addressToAnalyze) {
      const blockAddress = async () => {
        toast.error(
          'AML verification has not been successfully completed, you will be redirected to another page',
          { 
            onClose: async () => {
              await disconnect();
              setLoading(false);
              window.location.href = '/block/index.html'
            }
          })
      }

      try {
        const res = await fetch(`${SDAI_API_URL}/analyze-address`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ address: addressToAnalyze })
        });

        if (res.status !== 200) {
          throw new Error();
        }

        const { isAllowed } = await res.json();
        if (!isAllowed) {
          blockAddress();
          return;
        }
      } catch (error) {
        setLoading(false);
        toast.error("Couldn't run AML control");
        return;
      }
    }

    mutationTrigger?.();
    setLoading(false);
  }

  return (
    // <div className="full-width">
    <button
      className="border rounded-md w-full bg-[#FFC549] hover:border-[#FFC549] active:opacity-90 p-4 my-1 text-[#1C352A] text-center font-semibold text-xl "
      onClick={handleClick}
    >
      {method}
    </button>
    //  </div>
  );
};

export default ActionButton;
