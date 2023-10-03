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
import { useAccountStore, useLoadedAccountStore } from "../../stores/account";

export const Home = () => {
  // Store
  const account = useLoadedAccountStore(
    useShallow(state => ({
      address: state.address,
      sharesBalance: state.sharesBalance,
    })),
  );

  const { address, sharesBalance } = account || {};
  // Watch for address changes
  useEffect(() => {
    useAccountStore.getState().watch();
  }, []);

  // Modal close
  const { close } = useWeb3Modal();

  // Cards
  const vaultAPY = useVaultAPY();
  const sharesValue = useAccountShareValue();

  /** @notice Escape from connect modal */
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      close();
    }
  });

  return (
    <div className="page-home">
      <header className="page-component__header z-10">
        <div className="page-component__header__logo">
          <img className="page-component__header__logo__img" src={sDaiLogo} alt="sDAI" />
          <div className="page-component__header__logo__text">
            <div className="page-component__header__logo__title">Gnosis Earn</div>
            <div className="page-component__header__logo__slogan">Deposit xDAI</div>
          </div>
        </div>
        <div className="page-component__header__userinfo">
          <Web3NetworkSwitch />
          <div>
            <Web3Button />
          </div>
        </div>
      </header>

      <main className="h-screen w-full">
        <div className="bg-[#f3f0ea] rounded-t-3xl mt-24 pt-10 h-4/5">
          {address ? (
            <div className="m-auto w-1/2 h-fit">
              <div className="page-component__cards">
                <Card title="My Shares" value={sharesBalance?.value ?? BigInt(0)} currency="sDAI" />
                <Card
                  title="Value"
                  value={sharesValue ?? BigInt(0)}
                  currency="xDAI"
                  smallDecimals={3}
                />
                <Card
                  title="Vault APY"
                  value={vaultAPY.data ? vaultAPY.data * BigInt(100) : BigInt(0)}
                  currency="%"
                />
              </div>

              <Form />
            </div>
          ) : (
            <div className="page-component__prewallet h-36 py-36 text-[#45433C] text-2xl">
              <h1>Connect your Wallet to Gnosis</h1>
            </div>
          )}
        </div>
        <div className="footer w-full bg-[#F9F7F5]">
          <div className="m-auto flex flex-row w-1/2 gap-12">
            <div className=" flex flex-col my-5 w-3/5 gap-2">
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
            <div className=" flex flex-col my-5 w-2/5 items-start content-start gap-2">
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
