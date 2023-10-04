export interface ChainData {
  chainId: number;
  VAULT_ADAPTER_ADDRESS: `0x${string}`;
  BRIDGE_RECEIVER: `0x${string}`;
  RESERVE_TOKEN_ADDRESS: `0x${string}`;
  ERC4626_VAULT_ADDRESS: `0x${string}`;
  EXPLORER: string;
}

const gnosis: ChainData = {
  chainId: 100,
  VAULT_ADAPTER_ADDRESS: "0xD499b51fcFc66bd31248ef4b28d656d67E591A94",
  BRIDGE_RECEIVER: "0x670daeaF0F1a5e336090504C68179670B5059088",
  RESERVE_TOKEN_ADDRESS: "0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d",
  ERC4626_VAULT_ADDRESS: "0xaf204776c7245bF4147c2612BF6e5972Ee483701",
  EXPLORER: "https://gnosisscan.io/",
};

const gnosisChiado: ChainData = {
  chainId: 10200,
  VAULT_ADAPTER_ADDRESS: "0xc1529e13A5842D790da01F778Bf23a3677830986",
  BRIDGE_RECEIVER: "0x65e75819E4e8250a03958Ba303E8f95F8f578168",
  RESERVE_TOKEN_ADDRESS: "0x18c8a7ec7897177E4529065a7E7B0878358B3BfF",
  ERC4626_VAULT_ADDRESS: "0x20e5eB701E8d711D419D444814308f8c2243461F",
  EXPLORER: "https://gnosis-chiado.blockscout.com",
};

export const supportedChains: ChainData[] = [gnosis, gnosisChiado];

export const getChainData = (id: number) => {
  return supportedChains.find(x => x.chainId === id);
}

export const WALLETCONNECT_PROJECTID = "006ebb71415ac00246c619155f5d56f7";

export const ZERO = BigInt(0);
export const MAX_UINT256 = BigInt(0xffffffffffffffffffffffffffffffffffffffff);

export const paragraph_aboutSDai = `sDAI are shares of a vault with DAI, which is earning interest in MakerDAO DSR. You can use it in Gnosis DeFi like you would use DAI.`;
