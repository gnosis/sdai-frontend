// React
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  KeyboardEvent,
} from "react";
// Ethers
import { ethers } from "ethers";
import { Web3NetworkSwitch, useWeb3Modal, Web3Button } from "@web3modal/react";
import { useAccount, usePublicClient } from "wagmi";

import {
  /*RedeemSharesToNative,
  RedeemShares,
  ApproveShares,
  ApproveAssets,
  DepositAssets,
  NoReceiver,
  DepositNativeAssets,*/
  useVaultAPY,
  useTokenAllowance,
  useTotalReserves,
  useTotalSupply,
  useUserBalanceToken,
  useUserBalance,
  useUserReservesBalance,
} from "../../hooks/useData";

import "../../components/Input/Input";
// CSS
import "./Home.css";

// Assets
import sDaiLogo from "../../assets/Savings-xDAI.svg";
import wxdaiLogo from "../../assets/xdai.png";
import Card from "../../components/Card/Card";
import Form from "../../components/Form/Form";
import { formatWeiComma, formatWei, formatContractAddress, VaultState } from "../../utils/utils";
import { ZERO } from "../../constants";

// Addresses
const VAULT_ROUTER_ADDRESS = "0x0EA5928162b0F74BAEf31c00A04A4cEC5Fe9f4b2";
const BRIDGE_RECEIVER = "0x071bf5695afeda65c405794c6574ae63ca8b73c3";
const RESERVE_TOKEN_ADDRESS = "0x18c8a7ec7897177E4529065a7E7B0878358B3BfF";
const ERC4626_VAULT_ADDRESS = "0x20e5eB701E8d711D419D444814308f8c2243461F";

export const Home = () => {
  // web3-react -----------
  // ------------ Refs -------------

  const { address, isConnected } = useAccount();
  const client = usePublicClient();

  /** @notice Deposit/Withdrawal amount input */
  const amountRef = useRef<HTMLInputElement>(null);

  /** @notice Deposit/Withdrawal address input */
  const receiverRef = useRef<HTMLInputElement>(null);

  // ------------ States -------------

  /** @notice Opens connect button modal */
  const { isOpen, open, close, setDefaultChain } = useWeb3Modal();

  const [currentUser, setCurrentUser] = useState<`0x${string}`>(`0x`);
  const [currentChain, setCurrentChain] = useState<string>("");

  // Deposit

  /** @notice Sets asset deposit amount */
  const [assetAmount, setAssetAmount] = useState<BigInt>(ZERO);
  /** @notice Sets the receiver address for deposits/withdrawals */
  const [actionReceiver, setActionReceiver] = useState<string>("");

  // Withdrawal

  /** @notice Sets shares amount to redeem */
  const [sharesAmount, setSharesAmount] = useState<BigInt>(ZERO);

  // Allowance

  /** @notice Allowance of vault in ERC20 */
  const [depositAllowance, setDepositAllowance] = useState<BigInt>(ZERO);
  const [withdrawAllowance, setWithdrawAllowance] = useState<BigInt>(ZERO);

  // User Info

  /** @notice ETH balance of signer */
  const [XDAIBalance, setXDAIBalance] = useState<BigInt>(ZERO);
  /** @notice Asset balance of signer */
  const [assetBalance, setAssetBalance] = useState<BigInt>(ZERO);
  /** @notice Share balance of signer */
  const [sharesBalance, setSharesBalance] = useState<BigInt>(ZERO);
  /** @notice Share balance of signer */
  const [reservesBalance, setReservesBalance] = useState<BigInt>(ZERO);
  // Vault info

  /** @notice Total Assets held by the vault contract */
  const [totalAssets, setTotalAssets] = useState<BigInt>(ZERO);
  const [vaultAPY, setVaultAPY] = useState<BigInt>(ZERO);
  /** @notice Total Shares minted by the vault contract */
  const [totalShares, setTotalShares] = useState<BigInt>(ZERO);

  useEffect(() => {
    if (address && address !== currentUser) {
      setCurrentUser(address);
    }
    if (client.key !== currentChain) setCurrentChain(client.key);
  }, [address, client.key, currentChain, currentUser]);

  // User asset balance
  useUserBalanceToken(RESERVE_TOKEN_ADDRESS, address);
  // User shares balance
  useUserBalanceToken(ERC4626_VAULT_ADDRESS, address);
  // Asset Allowance
  useTokenAllowance(RESERVE_TOKEN_ADDRESS, address);
  // Share Allowance
  useTokenAllowance(ERC4626_VAULT_ADDRESS, address);

  /** @notice Escape from connect modal */
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      close();
    }
  });

  const firstFetch = {
    totalShares: useTotalSupply(),
    totalAssets: useTotalReserves(),
    vaultAPY: useVaultAPY(),
    assetBalance: useUserBalanceToken(RESERVE_TOKEN_ADDRESS, address),
    XDAIBalance: useUserBalance(address),
    sharesBalance: useUserBalanceToken(ERC4626_VAULT_ADDRESS, address),
    reservesBalance: useUserReservesBalance(address),
    depositAllowance: useTokenAllowance(RESERVE_TOKEN_ADDRESS, address),
    withdrawAllowance: useTokenAllowance(ERC4626_VAULT_ADDRESS, address),
  };

  const [vaultState, setVaultState] = useState<VaultState>(firstFetch);

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
              value={sharesBalance ? sharesBalance : BigInt(0)}
              currency="sDAI"
            />
            <Card
              title="Current Value"
              value={reservesBalance ? reservesBalance : BigInt(0)}
              currency="xDAI"
            />
            <Card
              title="Vault APY"
              value={vaultAPY ? vaultAPY.valueOf() * BigInt(100) : BigInt(0)}
              currency="%"
            />
          </div>
          <div className="page-component__main__action-modal">
            <Form currentUser={currentUser} vaultState={vaultState} setVaultState={setVaultState} />
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
