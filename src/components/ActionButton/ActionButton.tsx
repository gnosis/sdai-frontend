import React, { useEffect } from "react";
import { TransactionReceipt } from "viem";
import { useWaitForTransaction } from "wagmi";
import { disconnect, WriteContractResult } from "wagmi/actions";
import { AML } from "elliptic-sdk";

// TODO it will be exposed
const ELLIPTIC_API_KEY: string = import.meta.env.VITE_ELLIPTIC_API_KEY ?? ''
const ELLIPTIC_API_SECRET: string = import.meta.env.VITE_ELLIPTIC_API_SECRET ?? ''


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
    if (addressToAnalyze) {
      const blockAddress = async () => {
        await disconnect();
        window.location.href = '/block/index.html';
      }
      
      const { client } = new AML({ key: ELLIPTIC_API_KEY, secret: ELLIPTIC_API_SECRET });
      const requestBody = {
        subject: {
          asset: 'holistic',
          blockchain: 'holistic',
          type: 'address',
          hash: addressToAnalyze,
        },
        type: 'wallet_exposure',
        // customer_reference: 'my_customer',
      };

      try {
        const res = await client.post('/v2/wallet/synchronous', requestBody);

        if (res.status === 200) {
          // TODO: Check the status data and possible responses
          // with 200 there's:
          // "error": {
          //   "message": "something went wrong"
          // }
          console.log(res.data);
        } else {
          await blockAddress();
        }
      } catch (error) {
        console.error('Error:', error);
        await blockAddress();
      }
    }

    // isDenied: result from `https://sdai-api.dev.gnosisdev.com/api/v1/denylist/${address}`
    if (isDenied) {
      console.error('Action failed')
    } else {
      mutationTrigger?.()
    }
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
