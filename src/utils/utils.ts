import { ethers } from "ethers"; 
  
  // ------------ Util functions -------------

  /** @notice Format address to `0x1234...5678` */
  export const formatAddress = (address: string | null | undefined) => {
    if (address) {
      return address?.slice(0, 4) + "..." + address?.slice(-4);
    }
  };

  function commify(value:string) {
    const match = value.match(/^(-?)([0-9]*)(\.?)([0-9]*)$/);
    if (!match || (!match[2] && !match[4])) {
      throw new Error(`bad formatted number: ${ JSON.stringify(value) }`);
    }

    const neg = match[1];
    const whole = BigInt(match[2] || 0).toLocaleString("en-us");
    const frac = match[4] && match[4].match(/^(.*?)0*$/)? match[4].match(/^(.*?)0*$/): "0";

    return `${ neg }${ whole }.${ frac }`;
  }

  export const formatWeiComma = (number: BigInt) => {
    return commify((+ethers.formatUnits(number.toString())).toFixed(2));
  };

  export const formatWei = (number: BigInt) => {
    return (+ethers.formatUnits(number.toString())).toFixed(3);
  };

  /** @notice Format address to `0x1234...5678` */
  export const formatContractAddress = (address: string | null | undefined) => {
    return address?.slice(0, 8) + "..." + address?.slice(-5);
  };

  export default {formatAddress,formatWeiComma,formatWei,formatContractAddress};


  export interface VaultState {
    totalShares: BigInt;
    totalAssets: BigInt;
    vaultAPY: BigInt;
    XDAIBalance: BigInt;
    assetBalance: BigInt;
    sharesBalance: BigInt;
    depositAllowance: BigInt;
    withdrawAllowance: BigInt;
    reservesBalance: BigInt;
  }

  export interface FormState {
    assetAmount: BigInt;
    sharesAmount: BigInt;
    actionReceiver: `0x${string}`;
  }