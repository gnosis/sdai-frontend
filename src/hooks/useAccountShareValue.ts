import { useEffect, useState } from "react";
import { useShallow } from "zustand/shallow";

// Stores
import { useLoadedAccountStore } from "../stores/account";
import { useLoadedVaultStore } from "../stores/vault";

export const useAccountShareValue = () => {
  const { sharesBalance, reservesBalance } = useLoadedAccountStore(
    useShallow(state => ({
      sharesBalance: state.sharesBalance,
      reservesBalance: state.reservesBalance,
    })),
    true,
  );

  const vault = useLoadedVaultStore(
    useShallow(state => ({
      totalSupply: state.totalSupply,
      dripRate: state.dripRate,
      lastClaimTimestamp: state.lastClaimTimestamp,
    })),
  );

  const [sharesValue, setSharesValue] = useState<bigint>(0n);

  useEffect(() => {
    const update = () => {
      if (!vault) {
        setSharesValue(0n);
        return;
      }

      const currentTime = Math.floor(Date.now() / 1000);
      const unclaimedTime = BigInt(currentTime) - vault.lastClaimTimestamp;
      const unclaimedValue = unclaimedTime * vault.dripRate;
      const newSharesValue =
        reservesBalance + (unclaimedValue * sharesBalance.value) / vault.totalSupply;

      setSharesValue(newSharesValue);
    };

    update();
    const interval = setInterval(update, 500);
    return () => clearInterval(interval);
  }, [vault, reservesBalance, sharesBalance.value]);

  return sharesValue;
};
