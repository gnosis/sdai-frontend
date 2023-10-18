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
      {loaded ? <Main /> : null}
    </div>
  );
};

export default Home;
