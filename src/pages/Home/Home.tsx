import { useEffect } from "react";
import { Web3NetworkSwitch, Web3Button, useWeb3Modal } from "@web3modal/react";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
        <div className="rounded-t-3xl mt-0 h-full sm:pt-10">
          {loaded ? (
            <Main />
          ) : (
            <div className="page-component__prewallet h-56 text-[#45433C] text-2xl flex flex-col justify-center sm:mb-10">
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
        <ToastContainer />
      </main>
      <footer className="bg-[#133629] text-[#f0ebde] font-karla">
        <div className="justify-center pt-6 pb-14 flex box-border">
          <div className="justify-center pl-2.5 pr-2.5 flex w-[1240px] flex-col lg:flex-row">
            <div className="self-center xs:self-auto mb-10 lg:mb-0 xs:ml-0 pr-0 xs:pr-5 w-50 xs:w-60 min-w-[200px] xs:min-w-[140px] text-left items-center pb-0 flex">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 300 32">
                <path fill="currentColor" d="M118.246 31.4211h16.785V.593934h-16.785V31.4211ZM105.629.586419h9.949V4.56733h-9.201c-1.519 0-2.761.43397-3.728 1.30004-.969.86607-1.452 2.00455-1.452 3.41355 0 1.40898.483 2.59258 1.452 3.45868.967.866 2.211 1.3 3.728 1.3h9.201V31.423H95.4936v-3.9885h10.5294c1.637 0 2.971-.4546 3.996-1.3657 1.028-.9093 1.542-2.0703 1.542-3.4793 0-1.4091-.514-2.555-1.542-3.4361-1.027-.8811-2.359-1.3208-3.996-1.3208l-1.336.0226c-4.297 0-7.787-3.4211-7.8137-7.6594l-.0057-.92991v-.03381c0-4.77371 3.9244-8.643782 8.7634-8.643782l-.002-.001879Zm41.673 0h9.64V4.56733h-8.891c-1.518 0-2.761.43397-3.728 1.30004-.968.86607-1.452 2.00455-1.452 3.41355 0 1.40898.484 2.59258 1.452 3.45868.967.866 2.212 1.3 3.728 1.3h8.891v8.5743c0 4.8657-3.998 8.8091-8.931 8.8091h-10.23v-3.9885h9.606c1.637 0 2.971-.4546 3.997-1.3657 1.027-.9093 1.541-2.0703 1.541-3.4793 0-1.4091-.514-2.555-1.541-3.4361-1.028-.8811-2.36-1.2982-3.997-1.2982h-8.792l-.055-8.58931v-.03381c0-4.77371 3.924-8.643782 8.763-8.643782l-.001-.001879Zm-131.6725 0H26.884V4.56733H15.9435c-2.0533 0-3.9526.50724-5.6938 1.51985-1.74129 1.0126-3.11908 2.39343-4.13148 4.14062-1.01241 1.7471-1.51862 3.6484-1.51862 5.7036 0 2.0553.50621 4.1312 1.51862 5.8634 1.0124 1.734 2.38829 3.1054 4.13148 4.118 1.7412 1.0126 3.6405 1.5199 5.6938 1.5199h6.653v-9.5794H11.7892v-3.8757H26.884v17.4435H15.6409C7.00502 31.4267 0 24.5226 0 16.0047 0 7.48867 6.99741.586419 15.6295.586419ZM59.6655 14.9v16.5324h-3.9831V14.9526c0-5.73555-4.7138-10.38527-10.5294-10.38527-5.8156 0-10.5294 4.64972-10.5294 10.38527v16.4798h-4.0173V.605206h14.5676c8.0042 0 14.4935 6.400644 14.4935 14.296694l-.0019-.0019Zm72.3925-5.01039c0 2.95699-2.428 5.35239-5.421 5.35239-2.994 0-5.422-2.3972-5.422-5.35239 0-2.95515 2.428-5.35234 5.422-5.35234 2.993 0 5.421 2.39719 5.421 5.35234Zm35.733 6.08879v.0357c0 8.5141 6.998 15.407 15.63 15.407h6.605v-3.9884h-6.499c-6.485 0-11.728-5.2547-11.589-11.6835.135-6.25035 5.464-11.18375 11.803-11.18375h6.285V.605206h-6.649c-8.609 0-15.588 6.883464-15.588 15.375094l.002-.0019ZM285.509.605206h-14.568V31.4211h4.017V14.9526c0-5.73555 4.714-10.38527 10.53-10.38527 5.815 0 10.529 4.64972 10.529 10.38527v16.4685H300V14.9C300 7.00397 293.511.603327 285.507.603327l.002.001879ZM212.794 10.9398c0 .851-.306 1.5706-.915 2.1586-.611.588-1.332.8811-2.166.8811h-9.287c-.864 0-1.593-.2931-2.188-.8811-.596-.5862-.893-1.3057-.893-2.1586V.605206h-4.017V31.4211h4.017V20.893c0-.851.297-1.5706.893-2.1586.595-.5861 1.324-.8811 2.188-.8811h9.287c.834 0 1.555.2931 2.166.8811.609.588.915 1.3076.915 2.1586v10.5281h3.974V.605206h-3.974V10.9398ZM250.856.605206V31.4211h16.785V.605206h-16.785Zm8.393 14.638594c-2.996 0-5.422-2.3972-5.422-5.35231 0-2.95515 2.428-5.35234 5.422-5.35234 2.993 0 5.421 2.39719 5.421 5.35234 0 2.95511-2.428 5.35231-5.421 5.35231ZM236.148 2.24529c-.531-1.16102-1.281-1.743411-2.253-1.743411-.973 0-1.723.580511-2.253 1.743411L218.26 31.4211h31.137L236.148 2.24529Zm-2.253 24.12591c-2.996 0-5.422-2.3972-5.422-5.3523 0-2.9552 2.428-5.3524 5.422-5.3524 2.993 0 5.421 2.3972 5.421 5.3524 0 2.9551-2.428 5.3523-5.421 5.3523ZM92.2147 8.1556c-1.4329-2.38028-3.3664-4.25144-5.7966-5.61348C83.9861 1.18196 81.3371.5 78.4711.5c-2.8659 0-5.4065.68196-7.8823 2.04212-2.4758 1.36204-4.4093 3.2332-5.7966 5.61348-1.3911 2.3822-2.0838 4.9747-2.0838 7.7815 0 2.8067.6946 5.4012 2.0838 7.7814 1.3892 2.3822 3.3227 4.274 5.7966 5.6774 2.4758 1.4034 5.1001 2.1041 7.8823 2.1041 2.7822 0 5.5131-.7007 7.947-2.1041 2.4302-1.4034 4.3637-3.2952 5.7966-5.6774 1.433-2.3802 2.1486-4.9766 2.1486-7.7814 0-2.8049-.7156-5.4012-2.1486-7.7815Zm-13.677 13.2221c-3.0029 0-5.4369-2.4047-5.4369-5.3711 0-2.9665 2.434-5.3712 5.4369-5.3712 3.003 0 5.437 2.4047 5.437 5.3712 0 2.9664-2.434 5.3711-5.437 5.3711Z"></path>
              </svg>
            </div>
            <div className="pr-0 xs:pr-5 flex-wrap md:flex-nowrap justify-start md:justify-end mr-auto md:ml-auto w-auto clear-none gap-x-8 gap-y-0 flex-row flex-grow-0 flex-shrink self-start flex relative text-base items-start ml-auto xs:ml-0">
              <div className="w-full xs:w-auto md:w-full lg:w-auto text-center xs:text-left self-start block mb-10 xs:mb-0">
                <h1 className="uppercase mt-0 text-lg mb-2.5 font-bold">
                  Organization
                </h1>
                <div className="flex-col block">
                  <div role="list" className="gap-y-2.5 flex-col justify-start flex ml-0 mr-0 mb-0 xs:mb-7 md:mb-0">
                    <a role="listitem" className="w-full self-auto pl-0 float-left relative flex flex-col left-auto right-auto md:right-0" href="https://www.gnosis.io/validators">Validators</a>
                    <a role="listitem" className="w-full self-auto pl-0 float-left relative flex flex-col left-auto right-auto md:right-0" href="https://www.gnosis.io/developers">Developers</a>
                    <a role="listitem" className="w-full self-auto pl-0 float-left relative flex flex-col left-auto right-auto md:right-0" href="https://www.gnosis.io/community">Community</a>
                    <a role="listitem" className="w-full self-auto pl-0 float-left relative flex flex-col left-auto right-auto md:right-0" href="https://www.gnosis.io/blog">Blog</a>
                    <a role="listitem" className="w-full self-auto pl-0 float-left relative flex flex-col left-auto right-auto md:right-0" href="https://www.gnosis.io/careers">Careers</a>
                    <a role="listitem" className="w-full self-auto pl-0 float-left relative flex flex-col left-auto right-auto md:right-0" href="https://www.gnosis.io/about">About</a>
                  </div>
                </div>
              </div>
              <div className="w-full xs:w-auto md:w-full lg:w-auto text-center xs:text-left self-start block mb-10 xs:mb-0">
                <h1 className="uppercase mt-0 text-lg mb-2.5 font-bold">
                  Tools
                </h1>
                <div className="flex-col block">
                  <div role="list" className="gap-y-2.5 flex-col justify-start flex ml-0 mr-0 mb-0 xs:mb-7 md:mb-0">
                    <a role="listitem" className="w-full self-auto pl-0 float-left relative flex flex-col left-auto right-auto md:right-0" href="https://docs.gnosischain.com/node/">Gnosis Docs</a>
                    <a role="listitem" className="w-full self-auto pl-0 float-left relative flex flex-col left-auto right-auto md:right-0" href="https://gnosisfaucet.com/">xDai Faucet</a>
                    <a role="listitem" className="w-full self-auto pl-0 float-left relative flex flex-col left-auto right-auto md:right-0" href="https://buyxdai.com/">Buy xDAI</a>
                    <a role="listitem" className="w-full self-auto pl-0 float-left relative flex flex-col left-auto right-auto md:right-0" href="https://buyxdai.com/gno">Buy GNO</a>
                    <a role="listitem" className="w-full self-auto pl-0 float-left relative flex flex-col left-auto right-auto md:right-0" href="https://www.gnosismetrics.com/">Gnosis Metrics</a>
                    <a role="listitem" className="w-full self-auto pl-0 float-left relative flex flex-col left-auto right-auto md:right-0" href="https://www.validategnosis.com/">Validate Gnosis</a>
                    <a role="listitem" className="w-full self-auto pl-0 float-left relative flex flex-col left-auto right-auto md:right-0" href="https://mgno.validategnosis.com/">mGNO Deposit</a>
                    <a role="listitem" className="w-full self-auto pl-0 float-left relative flex flex-col left-auto right-auto md:right-0" href="https://d14n.info/">d14n.info</a>
                  </div>
                </div>
              </div>
              <div className="w-full xs:w-auto md:w-full lg:w-auto text-center xs:text-left self-start block mb-10 xs:mb-0">
                <h1 className="uppercase mt-0 text-lg mb-2.5 font-bold">
                  Directories
                </h1>
                <div className="flex-col block">
                  <div role="list" className="gap-y-2.5 flex-col justify-start flex ml-0 mr-0 mb-0 xs:mb-7 md:mb-0">
                    <a role="listitem" className="w-full self-auto pl-0 float-left relative flex flex-col left-auto right-auto md:right-0" href="https://www.daosongnosis.com/">DAO</a>
                    <a role="listitem" className="w-full self-auto pl-0 float-left relative flex flex-col left-auto right-auto md:right-0" href="https://www.gnosisdefi.com/">DeFi</a>
                    <a role="listitem" className="w-full self-auto pl-0 float-left relative flex flex-col left-auto right-auto md:right-0" href="https://www.gnosiswallets.com/">Wallet Finder</a>
                  </div>
                </div>
              </div>
              <div className="w-full xs:w-auto md:w-full lg:w-auto text-center xs:text-left self-start block mb-10 xs:mb-0">
                <h1 className="uppercase mt-0 text-lg mb-2.5 font-bold">
                  Socials
                </h1>
                <div className="flex-row justify-center md:justify-start flex max-w-full relative overflow-visible text-center md:text-left items-center md:items-stretch max-w-none sm:max-w-[100vw]">
                  <div role="list" className="gap-x-0 mb-6 md:mb-0 flex md:block ml-0 mr-0 mb-0 xs:mb-7 md:mb-0">
                    
                    <div role="listitem" className="w-full md:w-1/4 left-auto right-auto float-left pl-2 xs:pl-0 pr-2 xs:pr-4 relative block">
                      <a className="pr-0 md:pr-10" href="https://twitter.com/gnosischain" target="_blank">
                        <img src="https://assets-global.website-files.com/636962bb422ea43a44c85e47/636a6d360f91ef3fb8cb5f3f_icon-twitter.png" className="w-6" loading="lazy" alt="Twitter"/>
                      </a>
                    </div>
                    
                    <div role="listitem" className="w-full md:w-1/4 left-auto right-auto float-left pl-2 xs:pl-0 pr-2 xs:pr-4 relative block">
                      <a className="pr-0 md:pr-10" href="https://discord.gg/xW3X5EreBM" target="_blank">
                        <img src="https://assets-global.website-files.com/636962bb422ea43a44c85e47/636a6d453d7b977ef629f20d_icon-discord.png" className="w-6" loading="lazy" alt="Discord"/>
                      </a>
                    </div>
                    
                    <div role="listitem" className="w-full md:w-1/4 left-auto right-auto float-left pl-2 xs:pl-0 pr-0 xs:pr-4 relative block">
                      <a className="pr-0 md:pr-10" href="https://gnosischain.substack.com/" target="_blank">
                        <img src="https://assets-global.website-files.com/636962bb422ea43a44c85e47/636a6ddbbdf3c5a39f64236a_icon-substack.png" className="w-6" loading="lazy" alt="Substack"/>
                      </a>
                    </div>
                  
                  </div>
                </div>
              </div>
              <div className="w-full xs:w-auto md:w-full lg:w-auto text-center xs:text-left self-start block mb-10 xs:mb-0">
                <div className="flex-col block">
                  <div role="list" className="gap-y-2.5 flex-col justify-start flex ml-0 mr-0 mb-0 xs:mb-7 md:mb-0">
                    <a role="listitem" className="w-full self-auto pl-0 float-left relative flex flex-col left-auto right-auto md:right-0" href="https://www.gnosis.io/privacy-policy">Privacy Policy</a>
                    <a role="listitem" className="w-full self-auto pl-0 float-left relative flex flex-col left-auto right-auto md:right-0" href="https://www.gnosis.io/terms-conditions">Terms & Conditions</a>
                    <a role="listitem" className="w-full self-auto pl-0 float-left relative flex flex-col left-auto right-auto md:right-0" href="https://www.gnosis.io/cookie-policy">Cookie Policy</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
