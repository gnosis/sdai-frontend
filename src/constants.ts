interface ChainData {
  chainId: Number;
  VAULT_ADAPTER_ADDRESS: `0x${string}`;
  BRIDGE_RECEIVER: `0x${string}`;
  RESERVE_TOKEN_ADDRESS: `0x${string}`;
  ERC4626_VAULT_ADDRESS: `0x${string}`;
  EXPLORER: string;
}

const gnosis: ChainData = {
  chainId: 100,
  VAULT_ADAPTER_ADDRESS: "0x0EA5928162b0F74BAEf31c00A04A4cEC5Fe9f4b2",
  BRIDGE_RECEIVER: "0x071bf5695afeda65c405794c6574ae63ca8b73c3",
  RESERVE_TOKEN_ADDRESS: "0x18c8a7ec7897177E4529065a7E7B0878358B3BfF",
  ERC4626_VAULT_ADDRESS: "0x20e5eB701E8d711D419D444814308f8c2243461F",
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

export const chains: ChainData[] = [gnosis, gnosisChiado];

export const WALLETCONNECT_PROJECTID = "006ebb71415ac00246c619155f5d56f7";

export const ZERO = BigInt(0);

// Addresses
export const VAULT_ROUTER_ADDRESS = "0x0EA5928162b0F74BAEf31c00A04A4cEC5Fe9f4b2";
export const BRIDGE_RECEIVER = "0x071bf5695afeda65c405794c6574ae63ca8b73c3";
export const RESERVE_TOKEN_ADDRESS = "0x18c8a7ec7897177E4529065a7E7B0878358B3BfF";
export const ERC4626_VAULT_ADDRESS = "0x20e5eB701E8d711D419D444814308f8c2243461F";

export const paragraph_aboutSDai = `sDAI is similar to xDAI but with the added benefit of earning interest. \nYou can use it just like xDAI — own, transfer, and use it in the DeFi ecosystem. \nSwapping between sDAI and DAl incurs no costs and no slippage`;
