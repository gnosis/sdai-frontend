import { ethers, BigNumber } from "ethers";  
  
  // ------------ Util functions -------------

  /** @notice Format address to `0x1234...5678` */
  export const formatAddress = (address: string | null | undefined) => {
    if (address) {
      return address?.slice(0, 4) + "..." + address?.slice(-4);
    }
  };

  export const formatWeiComma = (number: BigNumber) => {
    return ethers.utils.commify((+ethers.utils.formatUnits(number.toString())).toFixed(2));
  };

  export const formatWei = (number: BigNumber) => {
    return (+ethers.utils.formatUnits(number.toString())).toFixed(3);
  };

  /** @notice Format address to `0x1234...5678` */
  export const formatContractAddress = (address: string | null | undefined) => {
    return address?.slice(0, 8) + "..." + address?.slice(-5);
  };

  export default {formatAddress,formatWeiComma,formatWei,formatContractAddress};