import React, { useEffect } from "react";
import { useShallow } from "zustand/shallow";
import { AML } from "elliptic-sdk";
import { disconnect } from 'wagmi/actions'

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
  
  useEffect(() => {
    const blockAddress = async () => {
      await disconnect();
      window.location.href = '/block/index.html';
    }

    const runAnalysis = async () => {
      if (account.address) {
        // TODO: add actual key
        const { client } = new AML({ key: "YOUR_ELLIPTIC_API_KEY", secret: "YOUR_ELLIPTIC_API_SECRET" });
        const requestBody = {
          subject: {
            asset: 'holistic',
            blockchain: 'holistic',
            type: 'address',
            hash: account.address,
          },
          type: 'wallet_exposure',
          customer_reference: 'my_customer',
        };

        try {
          const res = await client.post('/v2/wallet/synchronous', requestBody);

          if (res.status === 200) {
            // TODO: Check the status data and possible responses
            // with 200 there's:
            // "error": {
            //   "message": "something went wrong"
            // }
            console.log(res.data);
          } else {
            await blockAddress();
          }
        } catch (error) {
          console.error('Error:', error);
          await blockAddress();
        }
      }
    };

    runAnalysis();
  }, [account.address])

  return (
    <div className="bg-transparent m-auto w-full h-fit p-4 sm:p-1 sm:w-4/5 md:w-3/4 xl:w-1/2 sm:max-w-4xl">
      <div className="flex flex-col items-center justify-center mx-auto mt-0 sm:-mt-24 w-full gap-1 sm:flex-wrap-reverse sm:flex-row sm:gap-5 md:flex-nowrap 2xl:gap-10 ">
        <Card title="MY SHARES" value={sharesBalance.value ?? BigInt(0)} currency="sDAI" />
        <Card title="VALUE" value={sharesValue} currency="xDAI" smallDecimals={3} />
        <Card title="VAULT APY" value={apy ? apy * 100n : 0n} currency="%" />
      </div>
      <Form />
    </div>
  );
};

export default Main;
