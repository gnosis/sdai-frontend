import React from "react";
import { formatWei } from "../../utils/utils";

interface ICardProps {
  title: string;
  value: BigInt;
  currency: string;
}

const Card: React.FC<ICardProps> = ({ title, value, currency }) => {
  return (
    <div className="page-component__cards-data">
      <div className="page-component__main__input__btns">
        <div className="page-component__cards-data__title">{title}</div>
      </div>
      <div className="page-component__cards-data__body">
        <div className="page-component__cards-data__row">
          <div className="page-component__cards-data__number">{value ? formatWei(value) : "-"}</div>
          <div>{currency}</div>
        </div>
      </div>
    </div>
  );
};

export default Card;
