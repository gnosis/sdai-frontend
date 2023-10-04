import { useEffect } from "react";
import { Web3NetworkSwitch, useWeb3Modal, Web3Button } from "@web3modal/react";
import { useShallow } from "zustand/shallow";

// Hooks
import { useVaultAPY } from "../../hooks/useData";
import { useAccountShareValue } from "../../hooks/useAccountShareValue";

// Components
import Card from "../../components/Card/Card";
import Form from "../../components/Form/Form";
// CSS
import "./Home.css";

// Assets
import sDaiLogo from "../../assets/Savings-xDAI.svg";
import union from "../../assets/union.svg";
import refresh from "../../assets/refresh.svg";

// Constants
import { paragraph_aboutSDai } from "../../constants";
import { isLoadedAccountStore, useAccountStore, useLoadedAccountStore } from "../../stores/account";

const ConnectedHome = () => {
  // Store
  const sharesBalance = useLoadedAccountStore(state => state.sharesBalance, true);

  // Cards
  const vaultAPY = useVaultAPY();
  const sharesValue = useAccountShareValue();

  return (
    <div className="m-auto w-full h-fit p-4 sm:p-1 sm:w-4/5 md:w-3/4 xl:w-1/2 sm:max-w-4xl">
      <div className="flex flex-col flex-wrap items-center justify-center mx-auto mt-0 sm:-mt-24 w-full  gap-1 sm:flex-nowrap sm:gap-5 sm:flex-row 2xl:gap-10 ">
        <Card title="My Shares" value={sharesBalance?.value ?? 0n} currency="sDAI" />
        <Card title="Value" value={sharesValue ?? 0n} currency="xDAI" smallDecimals={3} />
        <Card title="Vault APY" value={vaultAPY.data ? vaultAPY.data * 100n : 0n} currency="%" />
      </div>
      <Form />
    </div>
  );
};

export const Home = () => {
  // Modal close
  const { close } = useWeb3Modal();

  // Store
  const account = useAccountStore(
    useShallow(state => ({
      address: state.address,
      loading: state.loading,
    })),
  );

  // Watch for address changes
  useEffect(() => useAccountStore.getState().watch(), []);

  /** @notice Escape from connect modal */
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      close();
    }
  });

  return (
    <div className="page-home">
      <header className="header flex shrink-0 content-between items-center px-5 pt-8 z-10 w-full sm:px-10">
        <div className="page-component__header__logo justify-self-start flex-auto">
          <img className="h-10 w-10" src={sDaiLogo} alt="sDAI" />
          <div className="ml-2">
            <div className="mt-3 font-base text-xl lg:text-2xl">Gnosis Earn</div>
            <div className="opacity-50 font-base text-base lg:text-xl">Deposit xDAI</div>
          </div>
        </div>
        <div className="page-component__header__userinfo justify-self-end flex-row-reverse flex-auto">
          <div className="hidden sm:inline">
            <Web3NetworkSwitch />
          </div>
          <div>
            <Web3Button />
          </div>
        </div>
      </header>

      <main className="w-full h-full m-auto">
        <div className="bg-[#f3f0ea] rounded-t-3xl mt-0 h-full sm:pt-10 sm:mt-24 ">
          {isLoadedAccountStore(account) ? (
            <ConnectedHome />
          ) : (
            <div className="page-component__prewallet h-36 py-36 text-[#45433C] text-2xl">
              <h1>Connect your Wallet to Gnosis</h1>
            </div>
          )}
        </div>
        <div className="footer w-full bg-[#F9F7F5] h-fit">
          <div className="m-auto flex flex-col w-full p-5 mb-5 sm:p-0 sm:w-4/5 md:w-3/4 xl:w-1/2 sm:max-w-4xl gap-12 sm:flex-row">
            <div className=" flex flex-col flex-1 w-full sm:w-3/5 sm:my-5 gap-2">
              <div className="title flex flex-start gap-2 items-start content-start">
                <img className="w-5" src={union}></img>
                <div className="text-[#716E64] font-bold text-base">What is sDAI?</div>
              </div>
              <div className="text-[#45433C] font-normal text-l">{paragraph_aboutSDai}</div>
              <div className="text-[#45433C] text-l">
                <a className="font-semibold" href="https://docs.gnosischain.com/" target="_blank">
                  Learn more
                </a>
              </div>
            </div>
            <div className=" flex flex-col flex-1 w-full sm:w-2/5 sm:my-5 items-start content-start gap-2">
              <div className="title flex flex-start gap-2">
                <img className="w-5" src={refresh}></img>
                <div className="text-[#716E64] font-bold text-base">Need to bridge or swap?</div>
              </div>
              <div className="text-[#45433C] font-normal text-l">
                {"Visit "}
                <a
                  className="font-semibold"
                  href="https://jumper.exchange/?fromChain=1&fromToken=0x6b175474e89094c44da98b954eedeac495271d0f&toChain=100&toToken=0x0000000000000000000000000000000000000000"
                  target="_blank"
                >
                  jumper.exchange
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
