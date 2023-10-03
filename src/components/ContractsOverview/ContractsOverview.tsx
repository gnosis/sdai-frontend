import { formatContractAddress } from "../../utils/utils";
import {
  VAULT_ROUTER_ADDRESS,
  BRIDGE_RECEIVER,
  RESERVE_TOKEN_ADDRESS,
  ERC4626_VAULT_ADDRESS,
  EXPLORER,
} from "../../constants";
import arrow_right from "../../assets/arrow_right.svg";

const ContractsOverview: React.FC = () => {

  return (
    <div className="rounded-2xl border border-[#DDDAD0] bg-[#F9F7F5] text-left p-5">
      <div className="contracts-row flex flex-row py-1">
        <div className="text-[#7A776D] font-medium text-sm flex-start">WXDAI</div>
        <div className="text-[#726F66] font-medium text-sm grow text-end font-mono">
          {formatContractAddress(RESERVE_TOKEN_ADDRESS)}
        </div>
        <a href={EXPLORER + "address/" + RESERVE_TOKEN_ADDRESS} target="_blank">
          <img className="w-4 fill-[#726F66]" src={arrow_right} alt={arrow_right} />
        </a>
      </div>
      <div className="contracts-row flex flex-row py-1">
        <div className="text-[#7A776D] font-medium text-sm">sDAI</div>
        <div className="text-[#726F66] font-medium text-sm  grow text-end font-mono">
          {formatContractAddress(ERC4626_VAULT_ADDRESS)}
        </div>
        <a href={EXPLORER + "address/" + ERC4626_VAULT_ADDRESS} target="_blank">
          <img className="w-4 fill-[#726F66]" src={arrow_right} alt={arrow_right} />
        </a>
      </div>
      <div className="contracts-row flex flex-row py-1">
        <div className="text-[#7A776D] font-medium text-sm">Bridge Receiver</div>
        <div className="text-[#726F66] font-medium text-sm  grow text-end font-mono">
          {formatContractAddress(BRIDGE_RECEIVER)}
        </div>
        <a href={EXPLORER + "address/" + BRIDGE_RECEIVER} target="_blank">
          <img className="w-4 fill-[#726F66]" src={arrow_right} alt={arrow_right} />
        </a>
      </div>
      <div className="contracts-row flex flex-row py-1">
        <div className="text-[#7A776D] font-medium text-sm">Vault Adapter</div>
        <div className="text-[#726F66] font-medium text-sm grow text-end font-mono">
          {formatContractAddress(VAULT_ROUTER_ADDRESS)}
        </div>
        <a href={EXPLORER + "address/" + VAULT_ROUTER_ADDRESS} target="_blank">
          <img className="w-4 fill-[#726F66]" src={arrow_right} alt={arrow_right} />
        </a>
      </div>
    </div>
  );
};

export default ContractsOverview;
