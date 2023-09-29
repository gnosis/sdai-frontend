import React from "react";
import "./Input.css";
import { ethers } from "ethers";
import { useConvertToAssets, useConvertToShares } from "../../hooks/useData";

interface IInputProps {
  deposit: boolean;
  amount: bigint;
}

const Input: React.FC<IInputProps> = ({ deposit, amount }) => {
  const shares = useConvertToShares(amount);
  const assets = useConvertToAssets(amount);

  const chosenValue = deposit ? shares.data : assets.data;
  const value = (+ethers.formatUnits(BigInt(chosenValue ?? BigInt(0)))).toFixed(2);

  // const value = ethers.commify(chosenValue);

  return <input type="number" disabled value={value} />;
};

export default Input;
