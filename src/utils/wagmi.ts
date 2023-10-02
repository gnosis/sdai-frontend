import { readContract } from "wagmi/actions";
import { VAULT_ROUTER_ADDRESS } from "../constants";
import { erc20ABI } from "wagmi";

export const getTokenAllowance = (token: `0x${string}`, address: `0x${string}`) => {
  return readContract({
    address: token,
    abi: erc20ABI,
    functionName: "allowance",
    args: [address, VAULT_ROUTER_ADDRESS],
  });
};
