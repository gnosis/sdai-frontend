import React from "react";
import { useShallow } from "zustand/shallow";
import "wagmi/window";

// Store
import { useLoadedAccountStore } from "../../stores/account";

const AddToken: React.FC = () =>{

  const account = useLoadedAccountStore(
    useShallow(state => ({
      address: state.address,     
    })),
  );

  if (!account) {
    throw new Error("rendered without account");
  }

  const addTokenToWallet = ()=>window.ethereum?.request({
    method: "wallet_watchAsset",
    params: {
      type: "ERC20",
      options: {
        name: "Savings xDAI",
        address: "0xaf204776c7245bF4147c2612BF6e5972Ee483701",
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
