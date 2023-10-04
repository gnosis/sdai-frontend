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
  deposit: boolean;
  onBalanceChange: (token: Token, balance: bigint, max: bigint, shares:bigint) => void;
};

export const TokenInput: React.FC<TokenInputProps> = ({ deposit, onBalanceChange }) => {
  const [token, setToken] = useState<Token>();
  const [balance, setBalance] = useState<bigint>(0n);
  const account = useLoadedAccountStore(
    useShallow(state => ({
      chain: state.chainData,
      nativeBalance: state.nativeBalance,
      reservesBalance: state.reservesBalance,
      wrappedBalance: state.wrappedBalance,
    })),
  );

  if (!account) {
    throw new Error("rendered without account");
  }

  // Balances
  const {chain, nativeBalance, wrappedBalance, reservesBalance } = account;
  const tokenBalance = deposit
    ? token?.name === "xDAI"
      ? nativeBalance.value
      : wrappedBalance.value
    : reservesBalance;

  // Shares
  const shares = useConvertToShares(chain.ERC4626_VAULT_ADDRESS, balance).data ?? BigInt(balance);

  // Functions
  const changeBalance = (balance: bigint) => {
    token && onBalanceChange(token, balance, tokenBalance, shares);
    setBalance(balance);
  };

  const setMax = () => {
    if (!token || tokenBalance === undefined) {
      return;
    }

    changeBalance(tokenBalance);
  };

  const selectToken = (token: Token) => {
    setToken(token);
    onBalanceChange(token, balance, tokenBalance, shares);
  };


  return (
    <div className="rounded-2xl border border-[#DDDAD0] bg-white p-5 my-1">
      <div className="flex justify-between items-center">
        <div className="text-3xl font-semibold">
          <input
            type="number"
            min="0"
            placeholder="0.00"
            step="0.01"
            autoComplete="off"
            max={tokenBalance ? formatUnits(tokenBalance, 18) : ""}
            value={balance ? formatUnits(balance, 18) : ""}
            onChange={e => changeBalance(parseUnits(e.target.value, 18))}
          />
        </div>
        <TokenSelector onSelected={selectToken} />
      </div>
      <div className="flex justify-between mt-2 items-center">
        <div className="text-[#999588] text-base font-semibold">{formatBalance(shares)}</div>
        <div className="text-sm text-[#7A776D]">
          <span className="font-medium">Balance {formatBalance(tokenBalance)}</span>
          <button className="font-bold ml-2 " onClick={setMax}>
            Max
          </button>
        </div>
      </div>
    </div>
  );
};
