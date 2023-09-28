// React
import React, { useState, useEffect, useRef, KeyboardEvent } from "react";
// Ethers
import { ethers, BigNumber } from "ethers";
import { Web3NetworkSwitch, useWeb3Modal, Web3Button } from "@web3modal/react";
import { useAccount, usePublicClient } from "wagmi";

import {
  RedeemSharesToNative,
  RedeemShares,
  ApproveShares,
  ApproveAssets,
  DepositAssets,
  NoReceiver,
  DepositNativeAssets,
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
// ABIS
import ERC20Abi from "../../abis/MyVaultTokenERC20.json";
import ERC4626Abi from "../../abis/MyVaultTokenERC4626.json";
import RouterAbi from "../../abis/VaultRouter.json";
import { parseEther } from "viem";
import Input from "../../components/Input/Input";
import { createImmediatelyInvokedFunctionExpression } from "typescript";
import { isDisabled } from "@testing-library/user-event/dist/utils";

// Addresses
const VAULT_ROUTER_ADDRESS = "0x0EA5928162b0F74BAEf31c00A04A4cEC5Fe9f4b2";
const BRIDGE_RECEIVER = "0x071bf5695afeda65c405794c6574ae63ca8b73c3";
const RESERVE_TOKEN_ADDRESS = "0x18c8a7ec7897177E4529065a7E7B0878358B3BfF";
const ERC4626_VAULT_ADDRESS = "0x20e5eB701E8d711D419D444814308f8c2243461F";

export const Home = () => {
  // web3-react -----------
  // ------------ Refs -------------

  const { address, isConnecting, isDisconnected } = useAccount();
  const client = usePublicClient();

  /** @notice Deposit/Withdrawal amount input */
  const amountRef = useRef<HTMLInputElement>(null);

  /** @notice Deposit/Withdrawal address input */
  const receiverRef = useRef<HTMLInputElement>(null);

  // ------------ States -------------

  /** @notice Opens connect button modal */
  const { isOpen, open, close, setDefaultChain } = useWeb3Modal();

  /** @notice Switches between deposit and redeem modal */
  const [deposit, setDeposit] = useState<boolean>(true);

  /** @notice Switches between xDAI and WXDAI */
  const [nativeAsset, setNativeAsset] = useState<boolean>(true);

  const [shouldUpdate, setShouldUpdate] = useState<boolean>(true);

  const [currentUser, setCurrentUser] = useState<`0x${string}`>(`0x`);
  const [currentChain, setCurrentChain] = useState<string>("");

  // Deposit

  /** @notice Sets asset deposit amount */
  const [assetAmount, setAssetAmount] = useState<BigNumber>(ethers.utils.parseUnits("0"));
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
  const [XDAIBalance, setXDAIBalance] = useState<BigNumber>();
  /** @notice Asset balance of signer */
  const [assetBalance, setAssetBalance] = useState<BigNumber>();
  /** @notice Share balance of signer */
  const [sharesBalance, setSharesBalance] = useState<BigNumber>();
  /** @notice Share balance of signer */
  const [reservesBalance, setReservesBalance] = useState<BigNumber>();
  // Vault info

  /** @notice Total Assets held by the vault contract */
  const [totalAssets, setTotalAssets] = useState<string>("-");
  const [vaultAPY, setVaultAPY] = useState<string>("-");
  /** @notice Total Shares minted by the vault contract */
  const [totalShares, setTotalShares] = useState<string>("-");

  /** @notice quick account */
  const myAddress = (e: any) => {
    if (!isDisconnected && address) {
      e.currentTarget.previousSibling.value = address;
      setActionReceiver(address);
    }
  };

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

  const formatWeiComma = (number: BigNumber) => {
    return ethers.utils.commify((+ethers.utils.formatUnits(number.toString())).toFixed(2));
  };

  const formatWei = (number: BigNumber) => {
    return (+ethers.utils.formatUnits(number.toString())).toFixed(3);
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
    setAssetAmount(ethers.utils.parseUnits("0"));
    setSharesAmount(ethers.utils.parseUnits("0"));

    if (amountRef.current) amountRef.current.value = "";
    if (receiverRef.current) receiverRef.current.value = "";
  };

  /** @notice Swap between xdai/wxdai asset */
  const swapAsset = () => {
    setNativeAsset(() => !nativeAsset);
    setAssetAmount(ethers.utils.parseUnits("0"));
    setSharesAmount(ethers.utils.parseUnits("0"));

    if (amountRef.current) amountRef.current.value = "";
    if (receiverRef.current) receiverRef.current.value = "";
  };

  const clearRefs = () => {
    setAssetAmount(ethers.utils.parseUnits("0"));
    setSharesAmount(ethers.utils.parseUnits("0"));

    if (amountRef.current) amountRef.current.value = "";
    if (receiverRef.current) receiverRef.current.value = "";
  };

  /** @notice Escape from connect modal */
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      close();
    }
  });

  useEffect(() => {
    if (address && address !== currentUser) {
      setCurrentUser(address);
    }
    if (client.key !== currentChain) setCurrentChain(client.key);
  }, [address, client.key, currentChain, currentUser]);

  function updateMe() {

  };

  const b = {
    newTotalSupply: useTotalSupply(),
    newDepositAmount: useTotalReserves(),
    newVaultAPY: useVaultAPY(),
    iAssetBalance: useUserBalanceToken(RESERVE_TOKEN_ADDRESS, address),
    iXDAIBalance: useUserBalance(address),
    iSharesBalance: useUserBalanceToken(ERC4626_VAULT_ADDRESS, address),
    iReservesBalance: useUserReservesBalance(address),
    iDepositAllowance: useTokenAllowance(RESERVE_TOKEN_ADDRESS, address),
    iWithdrawAllowance: useTokenAllowance(ERC4626_VAULT_ADDRESS, address),
  };

  useEffect(() => {
    setTotalShares(b.newTotalSupply);
    setTotalAssets(b.newDepositAmount);
    setVaultAPY(b.newVaultAPY);
    setXDAIBalance(b.iXDAIBalance);
    setAssetBalance(b.iAssetBalance);
    setSharesBalance(b.iSharesBalance);
    setDepositAllowance(b.iDepositAllowance);
    setWithdrawAllowance(b.iWithdrawAllowance);
    setReservesBalance(b.iReservesBalance);
  }, [b, sharesBalance]);

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
                  SHARES <div className="page-component__cards-data__separator"></div>
                </div>
              </div>
              <div className="page-component__cards-data__body">
                <div className="page-component__cards-data__row">
                  <div className="page-component__cards-data__number">
                    {sharesBalance ? formatWeiComma(sharesBalance) : "-"}
                  </div>
                  <div>sDAI</div>
                </div>
              </div>
            </div>
            <div className="page-component__cards-data">
              <div className="page-component__main__input__btns">
                <div className="page-component__cards-data__title">
                  RESERVES<div className="page-component__cards-data__separator"></div>
                </div>
              </div>
              <div className="page-component__cards-data__body">
                <div className="page-component__cards-data__row">
                  <div className="page-component__cards-data__number">
                    {reservesBalance ? formatWeiComma(reservesBalance) : "-"}
                  </div>
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
                        min="0"
                        placeholder="0.0"
                        onChange={(e: any) => {
                          if (e.target.value)
                            setAssetAmount(ethers.utils.parseUnits(e.target.value, 18));
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
                              amountRef.current.value = formatWei(assetBalance);

                              setAssetAmount(assetBalance);
                            }
                          } else {
                            if (amountRef.current && XDAIBalance) {
                              amountRef.current.value = formatWei(XDAIBalance);

                              setAssetAmount(XDAIBalance.sub("10000000000000000"));
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
                      <Input assets={assetAmount} shares={sharesAmount} deposit={deposit} />
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
                        onChange={(e: any) => {
                          if (e.target.value) setActionReceiver(e.target.value);
                        }}
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
                  {actionReceiver.length === 42 ? (
                    !nativeAsset &&
                    (depositAllowance?.isZero() || depositAllowance?.lt(assetAmount)) ? (
                      <ApproveAssets
                        amount={assetAmount}
                        setDepositAllowance={setDepositAllowance}
                      />
                    ) : nativeAsset ? (
                      <DepositNativeAssets
                        disabled={actionReceiver.length === 42 && assetAmount.gt(0) ? false : true}
                        amount={assetAmount}
                        receiver={actionReceiver}
                        setReservesBalance={setReservesBalance}
                        setXDAIBalance={setXDAIBalance}
                      />
                    ) : (
                      <DepositAssets
                        disabled={actionReceiver.length === 42 && assetAmount.gt(0) ? false : true}
                        amount={assetAmount._isBigNumber ? assetAmount : BigNumber.from(0)}
                        receiver={actionReceiver}
                        updater={updateMe}
                      />
                    )
                  ) : (
                    <NoReceiver />
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
                        min="0"
                        placeholder="0.0"
                        onChange={(e: any) => {
                          if (e.target.value)
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
                            amountRef.current.value = formatWei(sharesBalance);
                            setSharesAmount(sharesBalance);
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
                      <Input assets={assetAmount} shares={sharesAmount} deposit={deposit} />
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
                        onChange={(e: any) => {
                          if (e.target.value) setActionReceiver(e.target.value);
                        }}
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
                  {actionReceiver.length === 42 ? (
                    !nativeAsset &&
                    (withdrawAllowance?.lt(sharesAmount) || withdrawAllowance?.isZero()) ? (
                      <ApproveShares
                        amount={sharesAmount}
                        setWithdrawAllowance={setWithdrawAllowance}
                      />
                    ) : nativeAsset ? (
                      <RedeemSharesToNative
                        disabled={actionReceiver.length === 42 && sharesAmount.gt(0) ? false : true}
                        amount={sharesAmount._isBigNumber ? sharesAmount : BigNumber.from(0)}
                        receiver={actionReceiver}
                        // updater={useUpdateStates}
                      />
                    ) : (
                      <RedeemShares
                        disabled={actionReceiver.length === 42 && sharesAmount.gt(0) ? false : true}
                        amount={sharesAmount._isBigNumber ? sharesAmount : BigNumber.from(0)}
                        receiver={actionReceiver}
                      />
                    )
                  ) : (
                    <NoReceiver />
                  )}
                </div>
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
