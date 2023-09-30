// React
import React, { useState, useEffect } from "react";
// Ethers

import { Web3NetworkSwitch, useWeb3Modal, Web3Button } from "@web3modal/react";
import { useAccount, useBalance } from "wagmi";

import {
  useUserReservesBalance,
  useVaultAPY,
  useTotalSupply,
  useReceiverData,
} from "../../hooks/useData";

import "../../components/Input/Input";
// CSS
import "./Home.css";

// Assets
import sDaiLogo from "../../assets/Savings-xDAI.svg";
import Card from "../../components/Card/Card";
import Form from "../../components/Form/Form";

// Constants
import { ERC4626_VAULT_ADDRESS, paragraph_aboutSDai } from "../../constants";

export const Home = () => {
  // web3-react -----------
  // ------------ Refs -------------

  const { address, isConnected } = useAccount();

  // ------------ States -------------

  /** @notice Opens connect button modal */
  const { close } = useWeb3Modal();

  //card-1
  const sharesBalance = useBalance({ token: ERC4626_VAULT_ADDRESS, address });
  //card-2
  const reservesBalance = useUserReservesBalance(address);
  //card-3
  const vaultAPY = useVaultAPY();
  const totalShares = useTotalSupply();
  const { dripRate, lastClaimTimestamp } = useReceiverData();
  const [sharesValue, setSharesValue] = useState<bigint>(BigInt(0));

  /** @notice Escape from connect modal */
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      close();
    }
  });

  //update every 5 seconds
  useEffect(() => {
    const update = () => {
      if (
        lastClaimTimestamp.data &&
        dripRate.data &&
        sharesBalance.data?.value &&
        reservesBalance.data &&
        totalShares.data
      ) {
        const currentTime = Math.floor(Date.now() / 1000);
        const unclaimedTime = BigInt(currentTime) - lastClaimTimestamp.data;
        const unclaimedValue = unclaimedTime * dripRate.data;
        const sharesValue =
          reservesBalance.data + (unclaimedValue * sharesBalance.data.value) / totalShares.data;

        setSharesValue(sharesValue);
      }
    };

    update();
    const interval = setInterval(update, 500);
    return () => clearInterval(interval);
  }, [
    lastClaimTimestamp.data,
    dripRate.data,
    sharesBalance.data?.value,
    reservesBalance.data,
    totalShares.data,
  ]);

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
      {isConnected ? (
        <main className="page-component__main">
          <div className="page-component__main__container">
            <div className="page-component__cards">
              <Card title="Shares" value={sharesBalance.data?.value ?? BigInt(0)} currency="sDAI" />
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
