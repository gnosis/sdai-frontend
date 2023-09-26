// React
import React, { useState, useEffect, useRef, KeyboardEvent, useCallback } from "react";
// Ethers
import { ethers, BigNumber } from "ethers";
import { Web3NetworkSwitch, useWeb3Modal, Web3Button } from "@web3modal/react";
import {
  usePrepareContractWrite,
  useContractWrite,
  useBalance,
  useAccount,
  useContractRead,
} from "wagmi";

import {
  RedeemSharesToNative,
  RedeemShares,
  ApproveShares,
  ApproveAssets,
  useConvertToAssets,
  useConvertToShares,
  DepositAssets,
  DepositNativeAssets,
  useVaultAPY,
  useTokenAllowance,
  useTotalReserves,
  useTotalSupply,
  useUserBalanceToken,
  useUserBalance,
} from "../../hooks/useData";

import "../../components/Input/Input";
// CSS
import "./Home.css";

// Assets
import sDaiLogo from "../../assets/Savings-xDAI.svg";
import wxdaiLogo from "../../assets/xdai.png";
// ABIS
import ERC20Abi from "../../abis/MyVaultTokenERC20.json";
import ERC4626Abi from "../../abis/MyVaultTokenERC4626.json";
import RouterAbi from "../../abis/VaultRouter.json";
import { parseEther } from "viem";
import Input from "../../components/Input/Input";

// Addresses
const VAULT_ROUTER_ADDRESS = "0x0EA5928162b0F74BAEf31c00A04A4cEC5Fe9f4b2";
const BRIDGE_RECEIVER = "0x071bf5695afeda65c405794c6574ae63ca8b73c3";
const RESERVE_TOKEN_ADDRESS = "0x18c8a7ec7897177E4529065a7E7B0878358B3BfF";
const ERC4626_VAULT_ADDRESS = "0x20e5eB701E8d711D419D444814308f8c2243461F";

const Home = () => {
  // web3-react -----------
  // ------------ Refs -------------

  const { address, isConnecting, isDisconnected } = useAccount();

  /** @notice Deposit/Withdrawal amount input */
  const amountRef = useRef<HTMLInputElement>(null);

  const amountConvertRef = useRef<HTMLInputElement>(null);

  /** @notice Deposit/Withdrawal address input */
  const receiverRef = useRef<HTMLInputElement>(null);

  // ------------ States -------------

  /** @notice Opens connect button modal */
  const { isOpen, open, close, setDefaultChain } = useWeb3Modal();

  /** @notice Switches between deposit and redeem modal */
  const [deposit, setDeposit] = useState<boolean>(true);

  /** @notice Switches between xDAI and WXDAI */
  const [nativeAsset, setNativeAsset] = useState<boolean>(true);

  // Deposit

  /** @notice Sets asset deposit amount */
  const [depositAmount, setDepositAmount] = useState<BigNumber>(ethers.utils.parseUnits("0"));

  /** @notice Sets the receiver address for deposits/withdrawals */
  const [actionReceiver, setActionReceiver] = useState<string>("");

  // Withdrawal

  /** @notice Sets shares amount to redeem */
  const [sharesAmount, setSharesAmount] = useState<BigNumber>(ethers.utils.parseUnits("0"));

  // Allowance

  /** @notice Allowance of vault in ERC20 */
  const [depositAllowance, setDepositAllowance] = useState<BigNumber>();
  const [withdrawAllowance, setWithdrawAllowance] = useState<BigNumber>();

  // User Info

  /** @notice ETH balance of signer */
  const [XDAIBalance, setXDAIBalance] = useState<string>();

  /** @notice Asset balance of signer */
  const [assetBalance, setAssetBalance] = useState<string>();

  /** @notice Share balance of signer */
  const [sharesBalance, setSharesBalance] = useState<string>();

  // Vault info

  /** @notice Total Assets held by the vault contract */
  const [totalAssets, setTotalAssets] = useState<string>("-");

  //const [vaultAPY, setVaultAPY] = useState<string>("-");

  /** @notice Total Shares minted by the vault contract */
  const [totalShares, setTotalShares] = useState<string>("-");

  /** @notice quick account */
  const myAddress = (e: any) => {
    if (!isDisconnected && address) {
      e.currentTarget.previousSibling.value = address;
      setActionReceiver(address);
    }
  };

//  useConvertToShares(depositAmount);

 // useConvertToAssets(sharesAmount);

  const newTotalSupply = useTotalSupply();
  //assetBalance = useUserBalance(address);
  const newDepositAmount = useTotalReserves();

  // User asset balance
  useUserBalanceToken(RESERVE_TOKEN_ADDRESS, address);
  // User shares balance
  useUserBalanceToken(ERC4626_VAULT_ADDRESS, address);

  // Asset Allowance
  useTokenAllowance(RESERVE_TOKEN_ADDRESS, address);
  // Share Allowance
  useTokenAllowance(ERC4626_VAULT_ADDRESS, address);

  // ------------ Constant functions -------------

  /** @notice Format address to `0x1234...5678` */
  const formatAddress = (address: string | null | undefined) => {
    if (address) {
      return address?.slice(0, 4) + "..." + address?.slice(-4);
    }
  };

  /** @notice Format address to `0x1234...5678` */
  const formatContractAddress = (address: string | null | undefined) => {
    return address?.slice(0, 8) + "..." + address?.slice(-5);
  };

  /** @notice remove the annoying scroll of numbers when press keypad */
  const removeScroll = (e: KeyboardEvent) => {
    if (["Space", "ArrowUp", "ArrowDown"].indexOf(e.code) > -1) {
      e.preventDefault();
    }
  };

  /** @notice Swap between deposit/redeem modal */
  const swapModal = () => {
    setDeposit(() => !deposit);

    // Refresh inputs on every modal swap
    setDepositAmount(ethers.utils.parseUnits("0"));
    setSharesAmount(ethers.utils.parseUnits("0"));
    setActionReceiver("");

    if (receiverRef.current && amountRef.current && amountConvertRef.current) {
      amountRef.current.value = "";
      receiverRef.current.value = "";
      amountConvertRef.current.value = "";
    }
  };

  /** @notice Swap between xdai/wxdai asset */
  const swapAsset = () => {
    setNativeAsset(() => !nativeAsset);

    // Refresh inputs on every modal swap
    setDepositAmount(ethers.utils.parseUnits("0"));
    setSharesAmount(ethers.utils.parseUnits("0"));
    setActionReceiver("");

    if (receiverRef.current && amountRef.current && amountConvertRef.current) {
      amountRef.current.value = "";
      receiverRef.current.value = "";
      amountConvertRef.current.value = "";
    }
  };

  /** @notice Escape from connect modal */
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      close();
    }
  });

  // Router APY

  const vaultAPY = useVaultAPY();

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
      {!isDisconnected ? (
        <main className="page-component__main">
          <div className="page-component__cards">
            <div className="page-component__cards-data">
              <div className="page-component__main__input__btns">
                <div className="page-component__cards-data__title">
                  ISSUED SHARES <div className="page-component__cards-data__separator"></div>
                </div>
              </div>
              <div className="page-component__cards-data__body" onLoadedData={()=>setTotalShares(newTotalSupply)}>
                <div className="page-component__cards-data__row">
                  <div className="page-component__cards-data__number">{totalShares}</div>
                  <div>sDAI</div>
                </div>
              </div>
            </div>
            <div className="page-component__cards-data">
              <div className="page-component__main__input__btns">
                <div className="page-component__cards-data__title">
                  VAULT RESERVES<div className="page-component__cards-data__separator"></div>
                </div>
              </div>
              <div className="page-component__cards-data__body" onLoadedData={()=>setTotalAssets(newDepositAmount)}>
                <div className="page-component__cards-data__row">
                  <div className="page-component__cards-data__number">{totalAssets}</div>
                  <div>WXDAI</div>
                </div>
              </div>
            </div>
            <div className="page-component__cards-data">
              <div className="page-component__main__input__btns">
                <div className="page-component__cards-data__title">
                  VAULT APY <div className="page-component__cards-data__separator"></div>
                </div>
              </div>
              <div className="page-component__cards-data__body">
                <div className="page-component__cards-data__row">
                  <div className="page-component__cards-data__number">{vaultAPY}</div>
                  <div>%</div>
                </div>
              </div>
            </div>
          </div>
          <div className="page-component__main__action-modal">
            {deposit ? (
              <div className="page-component__main__form">
                <div className="page-component__main__action-modal-display">
                  <div className="page-component__main__action-modal-display__item__action">
                    Deposit
                  </div>
                  <div
                    className="page-component__main__action-modal-display__item"
                    onClick={() => swapModal()}
                  >
                    Redeem
                  </div>
                </div>
                <div className="page-component__main__action-modal-switch">
                  {nativeAsset ? (
                    <div className="page-component__main__action-modal-switch__asset__action">
                      xDAI
                    </div>
                  ) : (
                    <div
                      className="page-component__main__action-modal-switch__asset"
                      onClick={() => swapAsset()}
                    >
                      xDAI
                    </div>
                  )}
                  {nativeAsset ? (
                    <div
                      className="page-component__main__action-modal-switch__asset"
                      onClick={() => swapAsset()}
                    >
                      WXDAI
                    </div>
                  ) : (
                    <div className="page-component__main__action-modal-switch__asset__action">
                      WXDAI
                    </div>
                  )}
                </div>
                <div className="page-component__main__asset__margin">
                  <div className="page-component__main__asset">
                    <img
                      className="page-component__main__asset__img"
                      src={deposit ? wxdaiLogo : sDaiLogo}
                      alt={deposit ? "WXDAI" : "sDAI"}
                    />
                    <div className="page-component__main__input">
                      <input
                        type="number"
                        name="email"
                        placeholder="0.0"
                        onChange={(e: any) => {
                          setDepositAmount(ethers.utils.parseUnits(e.target.value, 18));
                        }}
                        onKeyDown={(event: KeyboardEvent) => removeScroll(event)}
                        autoComplete="off"
                        ref={amountRef}
                      />
                      <div
                        className="page-component__main__input__max-btn"
                        onClick={() => {
                          if (!nativeAsset) {
                            if (amountRef.current && assetBalance) {
                              amountRef.current.value = assetBalance;
                              setDepositAmount(ethers.utils.parseUnits(assetBalance));
                            }
                          } else {
                            if (amountRef.current && XDAIBalance) {
                              amountRef.current.value = XDAIBalance;
                              setDepositAmount(ethers.utils.parseUnits(XDAIBalance));
                              // ConvertToShares(ethers.utils.parseUnits(XDAIBalance));
                            }
                          }
                        }}
                      >
                        MAX
                      </div>
                    </div>
                  </div>
                  <div className="page-component__main__asset">
                    <img
                      className="page-component__main__asset__img"
                      src={!deposit ? wxdaiLogo : sDaiLogo}
                      alt={!deposit ? "WXDAI" : "sDAI"}
                    />
                    <div className="page-component__main__input">
                    <Input assets={depositAmount} shares={sharesAmount} deposit={deposit}/>
                    </div>
                  </div>
                </div>
                <div className="page-component__main__asset__margin">
                  <div className="page-component__main__asset">
                    <div className="page-component__main__actions">
                      <p>Receiver</p>
                    </div>
                    <div className="page-component__main__input">
                      <input
                        type="text"
                        placeholder="0x124...5678"
                        onChange={(e: any) => setActionReceiver(e.target.value)}
                        onKeyDown={e => removeScroll(e)}
                        autoComplete="off"
                        ref={receiverRef}
                      />
                      <div
                        className="page-component__main__input__max-btn"
                        onClick={(e: any) => myAddress(e)}
                      >
                        ME
                      </div>
                    </div>
                  </div>
                </div>
                <div>&nbsp;</div>
                <div className="page-component__main__input__btns">
                  {!nativeAsset && depositAllowance?.lt(depositAmount) ? (
                     <ApproveAssets amount={depositAmount}/>
                  ) : (
                    nativeAsset ? 
                    <DepositNativeAssets amount={depositAmount} receiver={actionReceiver}/>
                    :
                    <DepositAssets amount={depositAmount} receiver={actionReceiver}/>
                  )}
                </div>
              </div>
            ) : (
              <div className="page-component__main__form">
                <div className="page-component__main__action-modal-display">
                  <div
                    className="page-component__main__action-modal-display__item"
                    onClick={() => swapModal()}
                  >
                    Deposit
                  </div>
                  <div className="page-component__main__action-modal-display__item__action">
                    Redeem
                  </div>
                </div>
                <div className="page-component__main__action-modal-switch">
                  {nativeAsset ? (
                    <div className="page-component__main__action-modal-switch__asset__action">
                      xDAI
                    </div>
                  ) : (
                    <div
                      className="page-component__main__action-modal-switch__asset"
                      onClick={() => swapAsset()}
                    >
                      xDAI
                    </div>
                  )}
                  {nativeAsset ? (
                    <div
                      className="page-component__main__action-modal-switch__asset"
                      onClick={() => swapAsset()}
                    >
                      WXDAI
                    </div>
                  ) : (
                    <div className="page-component__main__action-modal-switch__asset__action">
                      WXDAI
                    </div>
                  )}
                </div>
                <div className="page-component__main__asset__margin">
                  <div className="page-component__main__asset">
                    <img
                      className="page-component__main__asset__img"
                      src={deposit ? wxdaiLogo : sDaiLogo}
                      alt={deposit ? "WXDAI" : "sDAI"}
                    />
                    <div className="page-component__main__input">
                      <input
                        type="number"
                        name="email"
                        placeholder="0.0"
                        onChange={(e: any) => {
                          setSharesAmount(ethers.utils.parseUnits(e.target.value, 18));
                        }}
                        onKeyDown={(event: KeyboardEvent) => removeScroll(event)}
                        autoComplete="off"
                        ref={amountRef}
                      />
                      <div
                        className="page-component__main__input__max-btn"
                        onClick={() => {
                          if (amountRef.current && sharesBalance) {
                            amountRef.current.value = sharesBalance;
                            setSharesAmount(ethers.utils.parseUnits(sharesBalance));
                          }
                        }}
                      >
                        MAX
                      </div>
                    </div>
                  </div>
                  <div className="page-component__main__asset">
                    <img
                      className="page-component__main__asset__img"
                      src={!deposit ? wxdaiLogo : sDaiLogo}
                      alt={!deposit ? "WXDAI" : "sDAI"}
                    />
                    <div className="page-component__main__input">
                    <Input assets={depositAmount} shares={sharesAmount} deposit={deposit}/>
                    </div>
                  </div>
                </div>
                <div className="page-component__main__asset__margin">
                  <div className="page-component__main__asset">
                    <div className="page-component__main__actions">
                      <p>Receiver</p>
                    </div>
                    <div className="page-component__main__input">
                      <input
                        type="text"
                        placeholder="0x124...5678"
                        onChange={(e: any) => setActionReceiver(e.target.value)}
                        onKeyDown={e => removeScroll(e)}
                        autoComplete="off"
                        ref={receiverRef}
                      />
                      <div
                        className="page-component__main__input__max-btn"
                        onClick={(e: any) => myAddress(e)}
                      >
                        ME
                      </div>
                    </div>
                  </div>
                </div>
                <div>&nbsp;</div>
                {withdrawAllowance?.lt(sharesAmount) ? (
                  <ApproveShares amount={sharesAmount}/>
                ) : (
                  <div
                    className="page-component__main__input__action-btn"
                    onClick={() =>
                      nativeAsset
                        ? RedeemSharesToNative(sharesAmount, actionReceiver)
                        : RedeemShares(sharesAmount, actionReceiver)
                    }
                  >
                    Redeem
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="page-component__contract">
            <div className="page-component__contract-data">
              <div className="page-component__contract-data__body">
                <div className="page-component__contract-data__row">
                  <div>WXDAI Address</div>
                  <a
                    href={"https://gnosis-chiado.blockscout.com/address/" + RESERVE_TOKEN_ADDRESS}
                    className="page-component__main__tooltip"
                    target="noopener"
                    style={{ cursor: "pointer", textDecoration: "none", color: "inherit" }}
                  >
                    {formatContractAddress(RESERVE_TOKEN_ADDRESS)}
                  </a>
                </div>
                <div className="page-component__contract-data__row">
                  <div>sDAI Address</div>
                  <a
                    href={"https://gnosis-chiado.blockscout.com/address/" + ERC4626_VAULT_ADDRESS}
                    className="page-component__main__tooltip"
                    target="noopener"
                    style={{ cursor: "pointer", textDecoration: "none", color: "inherit" }}
                  >
                    {formatContractAddress(ERC4626_VAULT_ADDRESS)}
                  </a>
                </div>
                <div className="page-component__contract-data__row">
                  <div>Bridge Receiver Address</div>
                  <a
                    href={"https://gnosis-chiado.blockscout.com/address/" + BRIDGE_RECEIVER}
                    className="page-component__main__tooltip"
                    target="noopener"
                    style={{ cursor: "pointer", textDecoration: "none", color: "inherit" }}
                  >
                    {formatContractAddress(BRIDGE_RECEIVER)}
                  </a>
                </div>
                <div className="page-component__contract-data__row">
                  <div>Vault Router Address</div>
                  <a
                    href={"https://gnosis-chiado.blockscout.com/address/" + VAULT_ROUTER_ADDRESS}
                    className="page-component__main__tooltip"
                    target="noopener"
                    style={{ cursor: "pointer", textDecoration: "none", color: "inherit" }}
                  >
                    {formatContractAddress(VAULT_ROUTER_ADDRESS)}
                  </a>
                </div>
              </div>
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
