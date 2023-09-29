// React
import React, { useState, useEffect } from "react";
// Ethers

import { Web3NetworkSwitch, useWeb3Modal, Web3Button } from "@web3modal/react";
import { useAccount, useBalance, usePublicClient } from "wagmi";

import { useUserReservesBalance, useVaultAPY } from "../../hooks/useData";

import "../../components/Input/Input";
// CSS
import "./Home.css";

// Assets
import sDaiLogo from "../../assets/Savings-xDAI.svg";
import Card from "../../components/Card/Card";
import Form from "../../components/Form/Form";

// Constants
import { ERC4626_VAULT_ADDRESS } from "../../constants";

export const Home = () => {
  // web3-react -----------
  // ------------ Refs -------------

  const { address, isConnected } = useAccount();
  const client = usePublicClient();

  // ------------ States -------------

  /** @notice Opens connect button modal */
  const { close } = useWeb3Modal();

  const [currentUser, setCurrentUser] = useState<`0x${string}`>(`0x`);
  const [currentChain, setCurrentChain] = useState<string>("");

  const vaultAPY = useVaultAPY();
  const sharesBalance = useBalance({ token: ERC4626_VAULT_ADDRESS, address });
  const reservesBalance = useUserReservesBalance(address);

  useEffect(() => {
    if (address && address !== currentUser) {
      setCurrentUser(address);
    }
    if (client.key !== currentChain) setCurrentChain(client.key);
  }, [address, client.key, currentChain, currentUser]);

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
          <div className="page-component__cards">
            <Card
              title="My Shares"
              value={sharesBalance.data?.value ?? BigInt(0)}
              currency="sDAI"
            />
            <Card title="Current Value" value={reservesBalance.data ?? BigInt(0)} currency="xDAI" />
            <Card title="Vault APY" value={vaultAPY.data ?? BigInt(0)} currency="%" />
          </div>
          <div className="page-component__main__action-modal">
            <Form currentUser={currentUser} />
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
