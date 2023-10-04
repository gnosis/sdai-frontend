import { ethers } from "ethers";

// ------------ Util functions -------------

export const bigIntMin = (...args: bigint[]) => args.reduce((m, e) => (e < m ? e : m));
export const bigIntMax = (...args: bigint[]) => args.reduce((m, e) => (e > m ? e : m));

export const bigIntSqrt = (x: bigint) => {
  let z = (x + 1n) / 2n;
  let y = x;
  while (z - y < 0) {
    y = z;
    z = x / z + z / 2n;
  }
  return y;
};

export const bigIntCeil = (n: bigint, d: bigint) => n / d + (n % d ? 1n : 0n);
export const bigIntfloor = (n: bigint, d: bigint) => n / d;

/** @notice Format address to `0x1234...5678` */
export const formatAddress = (address: string | null | undefined) => {
  if (address) {
    return address?.slice(0, 4) + "..." + address?.slice(-4);
  }
};

export const formatWei = (number: bigint) => {
  return (+ethers.formatUnits(number.toString())).toFixed(2);
};

/** @notice Format address to `0x1234...5678` */
export const formatContractAddress = (address: string | null | undefined) => {
  return address?.slice(0, 8) + "..." + address?.slice(-5);
};

export default { formatAddress, formatWei, formatContractAddress };

export interface VaultState {
  totalShares: bigint;
  totalAssets: bigint;
  vaultAPY: bigint;
  XDAIBalance: bigint;
  assetBalance: bigint;
  sharesBalance: bigint;
  depositAllowance: bigint;
  withdrawAllowance: bigint;
  reservesBalance: bigint;
}

export interface FormState {
  assetAmount: bigint;
  sharesAmount: bigint;
  actionReceiver: `0x${string}`;
}
