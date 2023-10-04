import { useEffect, useState } from "react";
import { useShallow } from "zustand/shallow";

// Stores
import { useLoadedAccountStore, } from "../stores/account";
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

  const { chain, sharesBalance, reservesBalance } = account;

  const totalShares = useTotalSupply(chain.ERC4626_VAULT_ADDRESS);
  const { dripRate, lastClaimTimestamp } = useReceiverData(chain.BRIDGE_RECEIVER);
  const [sharesValue, setSharesValue] = useState<bigint>(BigInt(0));

  useEffect(() => {
    const update = () => {
      console.log(lastClaimTimestamp.data, dripRate.data, totalShares.data)
      if (account && totalShares.data) {
        if (lastClaimTimestamp.data && dripRate.data) {
          const currentTime = Math.floor(Date.now() / 1000);
          const unclaimedTime = BigInt(currentTime) - lastClaimTimestamp.data;
          const unclaimedValue = unclaimedTime * dripRate.data;
          const newSharesValue =
            reservesBalance + (unclaimedValue * sharesBalance.value) / totalShares.data;

          setSharesValue(newSharesValue);
        }
        else
          setSharesValue(totalShares.data);
      }
    };

    update();
    const interval = setInterval(update, 5000);
    return () => clearInterval(interval);
  }, [account, lastClaimTimestamp.data, dripRate.data, totalShares.data]);
  return sharesValue;
};
