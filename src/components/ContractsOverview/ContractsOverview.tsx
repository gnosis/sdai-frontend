import { formatContractAddress } from "../../utils/utils";
import arrow_right from "../../assets/arrow_right.svg";
import { useShallow } from "zustand/shallow";
import { useLoadedChainStore } from "../../stores/chain";

const ContractsOverview: React.FC = () => {
  const { addresses, explorer } = useLoadedChainStore(
    useShallow(({ addresses, explorer }) => ({ addresses, explorer })),
  );

  return (
    <div className="rounded-2xl border border-[#DDDAD0] bg-[#F9F7F5] text-left p-5">
      <div className="contracts-row flex flex-row py-1">
        <div className="text-[#7A776D] font-medium text-sm flex-start">WXDAI</div>
        <div className="text-[#726F66] font-medium text-sm grow text-end font-mono">
          {formatContractAddress(addresses.reserveToken)}
        </div>
        <a href={explorer + "address/" + addresses.reserveToken} target="_blank">
          <img className="w-4 fill-[#726F66]" src={arrow_right} alt={arrow_right} />
        </a>
      </div>
      <div className="contracts-row flex flex-row py-1">
        <div className="text-[#7A776D] font-medium text-sm">sDAI</div>
        <div className="text-[#726F66] font-medium text-sm  grow text-end font-mono">
          {formatContractAddress(addresses.vault)}
        </div>
        <a href={explorer + "address/" + addresses.vault} target="_blank">
          <img className="w-4 fill-[#726F66]" src={arrow_right} alt={arrow_right} />
        </a>
      </div>
      <div className="contracts-row flex flex-row py-1">
        <div className="text-[#7A776D] font-medium text-sm">Bridge Receiver</div>
        <div className="text-[#726F66] font-medium text-sm  grow text-end font-mono">
          {formatContractAddress(addresses.bridgeReceiver)}
        </div>
        <a href={explorer + "address/" + addresses.bridgeReceiver} target="_blank">
          <img className="w-4 fill-[#726F66]" src={arrow_right} alt={arrow_right} />
        </a>
      </div>
      <div className="contracts-row flex flex-row py-1">
        <div className="text-[#7A776D] font-medium text-sm">Vault Adapter</div>
        <div className="text-[#726F66] font-medium text-sm grow text-end font-mono">
          {formatContractAddress(addresses.vaultAdapter)}
        </div>
        <a href={explorer + "address/" + addresses.vaultAdapter} target="_blank">
          <img className="w-4 fill-[#726F66]" src={arrow_right} alt={arrow_right} />
        </a>
      </div>
    </div>
  );
};

export default ContractsOverview;
