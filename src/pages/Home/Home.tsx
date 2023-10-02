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
      <header className="page-component__header">
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
      {address ? (
        <main className="page-component__main">
          <div className="page-component__main__container">
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
            <div className="page-component__paragraph">{paragraph_aboutSDai}</div>
            <div className="page-component__main__action-modal">
              <Form />
            </div>
          </div>
        </main>
      ) : (
        <div className="page-component__prewallet">
          <h1>Deposit xDAI and Earn</h1>
          <Web3Button />
        </div>
      )}
    </div>
  );
};

export default Home;
