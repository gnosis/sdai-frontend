import { readContract } from "wagmi/actions";
import { erc20ABI } from "wagmi";


export const getTokenAllowance = (token: `0x${string}`, address: `0x${string}`, spender:`0x${string}`) => {
    return readContract({
      address: token,
      abi: erc20ABI,
      functionName: "allowance",
      args: [address, spender],
    });
};
