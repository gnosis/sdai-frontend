import { formatUnits } from "ethers";

interface ICardProps {
  title: string;
  value: bigint;
  currency: string;
  decimals?: number;
  smallDecimals?: number;
}

const Card: React.FC<ICardProps> = ({
  title,
  value,
  currency,
  decimals = 2,
  smallDecimals = 0,
}) => {
  const full = (+formatUnits(value.toString())).toFixed(decimals + smallDecimals);

  return (
    <div className="bg-[#202520] opacity-95 flex flex-col flex-1 shrink-0 w-full align-center rounded-2xl p-5 text-[#ede0cb] sm:gap-6">
      <div className="page-component__main__input__btns">
        <div className="font-base align-start overflow-hidden bt-2xl text-sm sm:text-lg">
          {title}
        </div>
      </div>
      <div className="flex content-start gap-2 items-center text-base sm:text-2xl">
        <div className="text-white">
          {value ? full.substring(0, full.length - smallDecimals) : "0"}
          {smallDecimals > 0 && value > 0 && (
            <span className="text-base sm:text-xl">
              {full.substring(full.length - smallDecimals)}
            </span>
          )}
        </div>
        <div>{currency}</div>
      </div>
    </div>
  );
};

export default Card;
