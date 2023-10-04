import { formatContractAddress } from "../../utils/utils";
import arrow_right from "../../assets/arrow_right.svg";
import { useShallow } from "zustand/shallow";
import { useLoadedAccountStore } from "../../stores/account";

const ContractsOverview: React.FC = () => {
  const account = useLoadedAccountStore(
    useShallow(state => ({
      chainData: state.chainData,
    })),
  );
  if (!account) {
    throw new Error("rendered without account");
  }
  // Token input
  const { chainData } = account;

  return (
    <div className="rounded-2xl border border-[#DDDAD0] bg-[#F9F7F5] text-left p-5">
      <div className="contracts-row flex flex-row py-1">
        <div className="text-[#7A776D] font-medium text-sm flex-start">WXDAI</div>
        <div className="text-[#726F66] font-medium text-sm grow text-end font-mono">
          {formatContractAddress(chainData.RESERVE_TOKEN_ADDRESS)}
        </div>
        <a href={chainData.EXPLORER + "address/" + chainData.RESERVE_TOKEN_ADDRESS} target="_blank">
          <img className="w-4 fill-[#726F66]" src={arrow_right} alt={arrow_right} />
        </a>
      </div>
      <div className="contracts-row flex flex-row py-1">
        <div className="text-[#7A776D] font-medium text-sm">sDAI</div>
        <div className="text-[#726F66] font-medium text-sm  grow text-end font-mono">
          {formatContractAddress(chainData.ERC4626_VAULT_ADDRESS)}
        </div>
        <a href={chainData.EXPLORER + "address/" + chainData.ERC4626_VAULT_ADDRESS} target="_blank">
          <img className="w-4 fill-[#726F66]" src={arrow_right} alt={arrow_right} />
        </a>
      </div>
      <div className="contracts-row flex flex-row py-1">
        <div className="text-[#7A776D] font-medium text-sm">Bridge Receiver</div>
        <div className="text-[#726F66] font-medium text-sm  grow text-end font-mono">
          {formatContractAddress(chainData.BRIDGE_RECEIVER)}
        </div>
        <a href={chainData.EXPLORER + "address/" + chainData.BRIDGE_RECEIVER} target="_blank">
          <img className="w-4 fill-[#726F66]" src={arrow_right} alt={arrow_right} />
        </a>
      </div>
      <div className="contracts-row flex flex-row py-1">
        <div className="text-[#7A776D] font-medium text-sm">Vault Adapter</div>
        <div className="text-[#726F66] font-medium text-sm grow text-end font-mono">
          {formatContractAddress(chainData.VAULT_ADAPTER_ADDRESS)}
        </div>
        <a href={chainData.EXPLORER + "address/" + chainData.VAULT_ADAPTER_ADDRESS} target="_blank">
          <img className="w-4 fill-[#726F66]" src={arrow_right} alt={arrow_right} />
        </a>
      </div>
    </div>
  );
};

export default ContractsOverview;
