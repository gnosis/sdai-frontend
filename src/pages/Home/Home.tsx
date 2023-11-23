import { useEffect } from "react";
import { Web3NetworkSwitch, Web3Button, useWeb3Modal } from "@web3modal/react";

// Stores
import { useAccountStore, useIsAccountStoreLoaded } from "../../stores/account";
import { useChainStore, useIsChainStoreLoaded } from "../../stores/chain";
import { useIsVaultStoreLoaded, useVaultStore } from "../../stores/vault";

// Components
import Main from "../../components/Main/Main";

// CSS
import "./Home.css";

// Assets
import sDaiLogo from "../../assets/Savings-xDAI.svg";
import gnosisChainLogo from "../../assets/gnosis-chain.svg";
import union from "../../assets/union.svg";
import refresh from "../../assets/refresh.svg";
//import wavesVector from "../../assets/waves-vector.svg";

// Constants
import { paragraph_aboutSDai } from "../../constants";

export const Home = () => {
  // Modal close
  const { close } = useWeb3Modal();

  // Loaded state
  const accountStoreLoaded = useIsAccountStoreLoaded();
  const chainStoreLoaded = useIsChainStoreLoaded();
  const vaultStoreLoaded = useIsVaultStoreLoaded();
  const loaded = accountStoreLoaded && chainStoreLoaded && vaultStoreLoaded;

  useEffect(() => {
    useAccountStore.getState().watch();
    useChainStore.getState().watch();
    useVaultStore.getState().watch();
  }, []);

  /** @notice Escape from connect modal */
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      close();
    }
  });

  return (
    <div className="page-home">
      <header className="header flex shrink-0 content-between items-center mt-6 z-10 mx-auto w-full w-full h-fit sm:p-1 sm:w-4/5 md:w-3/4 xl:w-1/2 sm:max-w-4xl">
        <div className="page-component__header__logo justify-self-start flex-auto p-4 sm:p-1">
          <img className="h-10 w-10" src={sDaiLogo} alt="sDAI" />
          <div className="ml-2">
            <div className=" mt-3 font-base text-xl lg:text-2xl font-bold">Gnosis Earn</div>
            <div className="flex flex-auto items-stretch">
              <div className="text-[#3E6957] font-semibold text-base">BY</div>
              <img className="w-24 mx-1" src={gnosisChainLogo} alt="Gnosis Chain" />
            </div>
          </div>
        </div>
        <div className="page-component__header__userinfo justify-self-end flex-row-reverse flex-auto p-4 sm:p-1">
          <div className="hidden sm:inline">
            <Web3NetworkSwitch />
          </div>
          <div>
            <Web3Button />
          </div>
        </div>
      </header>
      <main className="w-full h-full mx-auto">
        <div className="rounded-t-3xl mt-0 h-full sm:pt-10 sm:mt-24">
          {loaded ? (
            <Main />
          ) : (
            <div className="page-component__prewallet h-36 py-36 text-[#45433C] text-2xl">
              <h1>Connect your Wallet to Gnosis</h1>
            </div>
          )}
        </div>
        <div className="footer w-full bg-[#F2EEE3] h-fit text-base">
          <div className="m-auto flex flex-col w-full p-5 sm:p-0 sm:w-4/5 md:w-3/4 xl:w-1/2 sm:max-w-4xl gap-12 sm:flex-row">
            <div className=" flex flex-col flex-1 w-full sm:w-3/5 sm:my-5 gap-2">
              <div className="title flex flex-start gap-2 items-start content-start">
                <img className="w-5" src={union}></img>
                <div className="text-[#6B6242] font-bold">What is sDAI?</div>
              </div>
              <div className="text-[#45433C] font-normal">{paragraph_aboutSDai}</div>
              <div className="text-[#3E6957]">
                <a className="font-semibold" href="https://docs.gnosischain.com/bridges/tokenbridge/xdai-bridge/#savings-xdai" target="_blank">
                  Learn more
                </a>
              </div>
            </div>
            <div className="flex flex-col flex-1 w-full sm:w-2/5 sm:my-5 items-start content-start gap-2">
              <div className="title flex flex-start gap-2">
                <img className="w-5" src={refresh}></img>
                <div className="text-[#6B6242] font-bold">Need to bridge or swap?</div>
              </div>
              <div className="text-[#3E6957] font-normal">
                Visit 
                <a
                  className="font-semibold px-1"
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
      <footer className="bg-[#1C352A]">

      </footer>
    </div>
  );
};

export default Home;
