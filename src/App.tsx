import Home from "./pages/Home/Home";
import "./App.css";
import { EthereumClient, w3mConnectors, w3mProvider } from "@web3modal/ethereum";
import { Web3Modal } from "@web3modal/react";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { gnosis, gnosisChiado } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";

const chiado = {
  ...gnosisChiado,
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 4967313,
    },
  },
} as const;

const chains = [gnosis, chiado];
const projectId = "006ebb71415ac00246c619155f5d56f7";

const { publicClient } = configureChains(
  chains,
  [
    jsonRpcProvider({
      rpc: chain => ({
        http:
          chain.name === "Gnosis"
            ? `https://rpc.gnosis.gateway.fm`
            : `https://rpc.chiado.gnosis.gateway.fm`,
      }),
    }),
    w3mProvider({ projectId }),
    publicProvider(),
  ],
  { stallTimeout: 3000, batch: { multicall: true } },
);
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, chains }),
  publicClient,
});
const ethereumClient = new EthereumClient(wagmiConfig, chains);

function App() {
  return (
    <div className="App">
      <WagmiConfig config={wagmiConfig}>
        <Home />
      </WagmiConfig>

      <Web3Modal
        projectId={projectId}
        ethereumClient={ethereumClient}
        themeVariables={{
          "--w3m-font-family": "Roboto, sans-serif",
          "--w3m-accent-color": "#FFC549",
          "--w3m-accent-fill-color": "#1C352A",
          "--w3m-overlay-background-color": "#3A6657",
        }}
        themeMode="dark"
      />
    </div>
  );
}

export default App;
