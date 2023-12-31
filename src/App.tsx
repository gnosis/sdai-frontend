import React from "react";
import Home from "./pages/Home/Home";
import "./App.css";
import { EthereumClient, w3mConnectors, w3mProvider } from "@web3modal/ethereum";
import { Web3Modal } from "@web3modal/react";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { gnosis, gnosisChiado } from "wagmi/chains";

const chains = [gnosis, gnosisChiado];
const projectId = "006ebb71415ac00246c619155f5d56f7";

const { publicClient } = configureChains(chains, [w3mProvider({ projectId })]);
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
        themeMode={"dark"}
      />
    </div>
  );
}

export default App;
