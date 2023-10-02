import { useState } from "react";
import { type Token, TokenSelector } from "../TokenSelector/TokenSelector";
import { RESERVE_TOKEN_ADDRESS } from "../../constants";
import { useAccount, useBalance } from "wagmi";
import { formatUnits, parseUnits } from "viem";
import { useConvertToShares } from "../../hooks/useData";

const formatBalance = (balance?: bigint) => {
  return new Number(formatUnits(balance ?? 0n, 18)).toFixed(2);
};

export type TokenInputProps = {
  onBalanceChange: (token: Token, balance: bigint) => void;
};

export const TokenInput: React.FC<TokenInputProps> = ({ onBalanceChange }) => {
  const [token, setToken] = useState<Token>();
  const [balance, setBalance] = useState<bigint | undefined>();
  const { address } = useAccount();

  // Balances
  const wrappedBalance = useBalance({
    token: RESERVE_TOKEN_ADDRESS,
    address,
    cacheTime: 2_000,
  });
  const nativeBalance = useBalance({ address, cacheTime: 2_000 });
  const tokenBalance = token?.name === "xDAI" ? nativeBalance : wrappedBalance;
  const balanceValue = tokenBalance.data?.value;

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
