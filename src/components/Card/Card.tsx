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
  const full = (+formatUnits(value.toString())).toFixed(
    decimals + smallDecimals
  );

  return (
    <div className="page-component__cards-data">
      <div className="page-component__main__input__btns">
        <div className="page-component__cards-data__title">{title}</div>
      </div>
      <div className="page-component__cards-data__body">
        <div className="page-component__cards-data__row">
          <div className="page-component__cards-data__number">
            {value ? full.substring(0, full.length - smallDecimals) : "-"}
            {smallDecimals > 0 && value > 0 && (
              <span style={{ fontSize: "0.75rem" }}>
                {full.substring(full.length - smallDecimals)}
              </span>
            )}
          </div>
          <div>{currency}</div>
        </div>
      </div>
    </div>
  );
};

export default Card;
