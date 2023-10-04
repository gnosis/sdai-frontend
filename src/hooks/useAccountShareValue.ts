import { useEffect, useState } from "react";
import { useShallow } from "zustand/shallow";

// Stores
import { useLoadedAccountStore } from "../stores/account";

// Hooks
import { useReceiverData, useTotalSupply } from "./useData";

export const useAccountShareValue = () => {
  const account = useLoadedAccountStore(
    useShallow(state => ({
      chain: state.chainData,
      address: state.address,
      sharesBalance: state.sharesBalance,
      reservesBalance: state.reservesBalance,
    })),
  );
  if (!account) {
    throw new Error("rendered without account");
  }

  const { sharesBalance, reservesBalance } = account;

  const totalShares = useTotalSupply();
  const { dripRate, lastClaimTimestamp } = useReceiverData();
  const [sharesValue, setSharesValue] = useState<bigint>(0n);

  useEffect(() => {
    const update = () => {
      if (account && totalShares.data) {
        if (lastClaimTimestamp.data && dripRate.data) {
          const currentTime = Math.floor(Date.now() / 1000);
          const unclaimedTime = BigInt(currentTime) - lastClaimTimestamp.data;
          const unclaimedValue = unclaimedTime * dripRate.data;
          const newSharesValue =
            reservesBalance + (unclaimedValue * sharesBalance.value) / totalShares.data;

          setSharesValue(newSharesValue);
        } else setSharesValue(reservesBalance);
      }
    };

    update();
    const interval = setInterval(update, 5000);
    return () => clearInterval(interval);
  }, [
    account,
    lastClaimTimestamp.data,
    dripRate.data,
    totalShares.data,
    reservesBalance,
    sharesBalance.value,
  ]);
  return sharesValue;
};
