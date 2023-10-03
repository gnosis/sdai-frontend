import { formatUnits } from "ethers";

// Components
import { type Token } from "../TokenSelector/TokenSelector";
import { ZERO } from "../../constants";

// Hooks
import { useConvertToAssets, useConvertToShares } from "../../hooks/useData";

export type TokenInputProps = {
  isDeposit: boolean;
  tokenInput: { token: Token; balance: bigint; max: bigint } | undefined;
};

const TransactionOverview: React.FC<TokenInputProps> = ({ isDeposit, tokenInput }) => {

  const assets = useConvertToAssets(BigInt(1e18)).data;
  const toShares = useConvertToShares(tokenInput?.balance ?? BigInt(0)).data;
  const toAssets = useConvertToAssets(tokenInput?.balance ?? BigInt(0)).data;

  const formatBalance = (balance?: bigint) => {
    return new Number(formatUnits(balance ?? 0n, 18)).toFixed(2);
  };

  return (
    <div className="rounded-2xl border border-[#DDDAD0] bg-[#F9F7F5] divide-y divide-solid text-left">
      <div className="text-[#7A776D] font-semibold text-base my-2 mx-5">Transaction overview</div>
      <div className="p-4">
        <div className="page-component__txinfo-data__row py-1">
          <div className=" text-[#7A776D] font-semibold text-sm">Exchange rate</div>
          <div className="text-[#45433C] font-semibold text-base">{`1 sDAI -> ${formatBalance(
            assets ?? BigInt(0),
          )} ${tokenInput?.token.name}`}</div>
        </div>
        <div className="page-component__txinfo-data__row py-1">
          <div className="text-[#7A776D] font-semibold text-sm">You receive</div>
          {isDeposit ? (
            <div className="text-[#45433C] font-semibold text-base">{`${formatBalance(
              toShares,
            )} sDAI worth ${formatBalance(tokenInput?.balance)} ${tokenInput?.token.name}`}</div>
          ) : (
            <div className="text-[#45433C] font-semibold text-base">{`${formatBalance(tokenInput?.balance)} ${tokenInput?.token.name} worth ${formatBalance(
              toShares,
            )} sDAI`}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionOverview;
