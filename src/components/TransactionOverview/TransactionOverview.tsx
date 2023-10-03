import { formatUnits } from "ethers";


const TransactionOverview: React.FC = () => {
  const assets = BigInt(11e17);
  const shares = BigInt(1e18);
  return (
    <div className="rounded-2xl border border-[#DDDAD0] bg-[#F9F7F5] divide-y divide-solid text-left">
      <div className="text-[#7A776D] font-semibold text-base my-2 mx-5">Transaction overview</div>
      <div className="p-4">
        <div className="page-component__txinfo-data__row py-1">
          <div className=" text-[#7A776D] font-semibold text-sm">Exchange rate</div>
          <div className="text-[#45433C] font-semibold text-base">{`1 sDAI -> ${formatUnits(assets)}`}</div>
        </div>
        <div className="page-component__txinfo-data__row py-1">
          <div className="text-[#7A776D] font-semibold text-sm">You receive</div>
          <div className="text-[#45433C] font-semibold text-base">{`${formatUnits(shares)} sDAI worth ${formatUnits(assets)} xDAI`}</div>
        </div>
      </div>
    </div>
  );
};

export default TransactionOverview;
