import { useEffect, useState } from "react";
import { useShallow } from "zustand/shallow";

// Stores
import { useLoadedAccountStore, } from "../stores/account";

import { ChainData, } from "../constants";

// Hooks
import { useReceiverData, useTotalSupply } from "./useData";

export const useAccountShareValue = (chain:ChainData) => {
  const account = useLoadedAccountStore(
    useShallow(state => ({
      address: state.address,
      sharesBalance: state.sharesBalance,
      reservesBalance: state.reservesBalance,
    })),
  );


  const totalShares = useTotalSupply(chain.ERC4626_VAULT_ADDRESS);
  const { dripRate, lastClaimTimestamp } = useReceiverData(chain.BRIDGE_RECEIVER);
  const [sharesValue, setSharesValue] = useState<bigint>(BigInt(0));

  useEffect(() => {
    const update = () => {
      if (account && lastClaimTimestamp.data && dripRate.data && totalShares.data) {
        const { sharesBalance, reservesBalance } = account;
        const currentTime = Math.floor(Date.now() / 1000);
        const unclaimedTime = BigInt(currentTime) - lastClaimTimestamp.data;
        const unclaimedValue = unclaimedTime * dripRate.data;
        const newSharesValue =
          reservesBalance + (unclaimedValue * sharesBalance.value) / totalShares.data;

        setSharesValue(newSharesValue);
      }
    };

    update();
    const interval = setInterval(update, 500);
    return () => clearInterval(interval);
  }, [account, lastClaimTimestamp.data, dripRate.data, totalShares.data]);

  return sharesValue;
};
