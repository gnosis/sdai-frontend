export interface ChainConfig {
  id: number;
  explorer: `https://${string}`;
  addresses: {
    vaultAdapter: `0x${string}`;
    bridgeReceiver: `0x${string}`;
    reserveToken: `0x${string}`; // wxDAI
    vault: `0x${string}`; // sDAI
  };
}

export const gnosis: ChainConfig = {
  id: 100,
  explorer: "https://gnosisscan.io/",
  addresses: {
    vaultAdapter: "0x02aE11DC9783467e0830041399a2D48251f63907",
    bridgeReceiver: "0x670daeaF0F1a5e336090504C68179670B5059088",
    reserveToken: "0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d",
    vault: "0xaf204776c7245bF4147c2612BF6e5972Ee483701",
  },
};

export const gnosisChiado: ChainConfig = {
  id: 10200,
  explorer: "https://gnosis-chiado.blockscout.com",
  addresses: {
    vaultAdapter: "0xc1529e13A5842D790da01F778Bf23a3677830986",
    bridgeReceiver: "0x65e75819E4e8250a03958Ba303E8f95F8f578168",
    reserveToken: "0x18c8a7ec7897177E4529065a7E7B0878358B3BfF",
    vault: "0x20e5eB701E8d711D419D444814308f8c2243461F",
  },
};

export const supportedChains: ChainConfig[] = [gnosis, gnosisChiado];

export const getChainData = (id: number) => {
  return supportedChains.find(chain => chain.id === id);
};

export const WALLETCONNECT_PROJECTID = "006ebb71415ac00246c619155f5d56f7";

export const ZERO = 0n;
export const MAX_UINT256 = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffn;
export const WEI_PER_ETHER = 1000000000000000000n;

export const paragraph_aboutSDai = `All DAI bridged to Gnosis earn interest at MakerDAO. This interest is given to sDAI holder. You can use sDAI in Gnosis Defi like you would use DAI.`;
