import React from "react";
import "wagmi/window";

const AddToken: React.FC = () => {

  const addTokenToWallet = () =>
    window.ethereum?.request({
      method: "wallet_watchAsset",
      params: {
        type: "ERC20",
        options: {
          name: "Savings xDAI",
          address: "0x20e5eB701E8d711D419D444814308f8c2243461F",
          symbol: "sDAI",
          decimals: 18,
          image:
            "https://bafybeidsob7u6ylp6ajg3yyosyjnp4uuqbwwzqhumkc5xll765bdbgwqhq.ipfs.w3s.link/sDAI.png",
        },
      },
    });

  return (
    // <div className="full-width">
    <button
      className="w-full text-[#1C352A] text-center font-semibold text-base"
      onClick={() => addTokenToWallet()}
    >
      + Add sDAI to wallet
    </button>
  );
};

export default AddToken;
