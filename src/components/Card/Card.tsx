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
    <div className="bg-[#E2DCCC] opacity-95 flex flex-col flex-1 shrink-0 w-full align-center rounded-2xl p-5 sm:gap-2">
      <div className="page-component__main__input__btns">
        <div className="text-[#6B6242] font-base align-start overflow-hidden bt-2xl text-sm sm:text-s">
          {title}
        </div>
      </div>
      <div className="flex content-start gap-2 items-center text-base sm:text-2xl text-[#3E6957]">
        <div className="text-base sm:text-2xl font-bold">
          {value ? full.substring(0, full.length - smallDecimals) : "0"}
          {smallDecimals > 0 && value > 0 && (
            <span className="text-base sm:text-lg">
              {full.substring(full.length - smallDecimals)}
            </span>
          )}
        </div>
        <div className="text-base sm:text-lg">{currency}</div>
      </div>
    </div>
  );
};

export default Card;
