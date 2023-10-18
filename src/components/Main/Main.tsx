import React from "react";
import { useShallow } from "zustand/shallow";

// Components
import Card from "../../components/Card/Card";
import Form from "../../components/Form/Form";

// Hooks
import { useLoadedAccountStore } from "../../stores/account";
import { useAccountShareValue } from "../../hooks/useAccountShareValue";
import { useVaultAPY } from "../../hooks/useVaultAPY";

const Main: React.FC = () => {
  const account = useLoadedAccountStore(
    useShallow(state => ({
      address: state.address,
      sharesBalance: state.sharesBalance,
    })),
    true,
  );

  // Token input
  const { sharesBalance } = account;

  // Cards
  const apy = useVaultAPY();
  const sharesValue = useAccountShareValue();

  return (
    <div className="m-auto w-full h-fit p-4 sm:p-1 sm:w-4/5 md:w-3/4 xl:w-1/2 sm:max-w-4xl">
      <div className="flex flex-col items-center justify-center mx-auto mt-0 sm:-mt-24 w-full gap-1 sm:flex-wrap-reverse sm:flex-row sm:gap-5 md:flex-nowrap 2xl:gap-10 ">
        <Card title="My Shares" value={sharesBalance.value ?? BigInt(0)} currency="sDAI" />
        <Card title="Value" value={sharesValue} currency="xDAI" smallDecimals={3} />
        <Card title="Vault APY" value={apy ? apy * 100n : 0n} currency="%" />
      </div>

      <Form />
    </div>
  );
};

export default Main;
