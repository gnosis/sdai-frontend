import { useState } from "react";
import { formatUnits, parseUnits } from "viem";
import { useShallow } from "zustand/shallow";

// Hooks
import { useConvertToShares } from "../../hooks/useData";

// Store
import { useLoadedAccountStore } from "../../stores/account";

// Components
import { type Token, TokenSelector } from "../TokenSelector/TokenSelector";

const formatBalance = (balance?: bigint) => {
  return new Number(formatUnits(balance ?? 0n, 18)).toFixed(2);
};

export type TokenInputProps = {
  onBalanceChange: (token: Token, balance: bigint) => void;
};

export const TokenInput: React.FC<TokenInputProps> = ({ onBalanceChange }) => {
  const [token, setToken] = useState<Token>();
  const [balance, setBalance] = useState<bigint | undefined>();
  const account = useLoadedAccountStore(
    useShallow(state => ({
      address: state.address,
      nativeBalance: state.nativeBalance,
      sharesBalance: state.sharesBalance,
      reservesBalance: state.reservesBalance,
      depositAllowance: state.depositAllowance,
      withdrawalAllowance: state.withdrawalAllowance,
      wrappedBalance: state.wrappedBalance,
    })),
  );

  if (!account) {
    throw new Error("rendered without account");
  }

  // Balances
  const { nativeBalance, wrappedBalance } = account;
  const tokenBalance = token?.name === "xDAI" ? nativeBalance : wrappedBalance;
  const balanceValue = tokenBalance.value;

  // Shares
  const shares = useConvertToShares(balance);

  const setMax = () => {
    if (!token || balanceValue === undefined) {
      return;
    }

    onBalanceChange(token, balanceValue);
    setBalance(balanceValue);
  };

  return (
    <div className="rounded-2xl border border-[#DDDAD0] bg-white p-6">
      <div className="flex justify-between items-center">
        <div className="text-3xl font-semibold">
          <input
            type="number"
            min="0"
            placeholder="0.00"
            step="0.01"
            autoComplete="off"
            max={balanceValue ? formatUnits(balanceValue, 18) : ""}
            value={balance ? formatUnits(balance, 18) : ""}
            onChange={e => setBalance(parseUnits(e.target.value, 18))}
          />
        </div>
        <TokenSelector onSelected={setToken} />
      </div>
      <div className="flex justify-between mt-2 items-center">
        <div className="text-[#999588] text-base font-semibold">{formatBalance(shares.data)}</div>
        <div className="text-xs text-[#7A776D]">
          <span className="font-medium">Balance {formatBalance(balanceValue)}</span>
          <button className="font-bold ml-2" onClick={setMax}>
            Max
          </button>
        </div>
      </div>
    </div>
  );
};
