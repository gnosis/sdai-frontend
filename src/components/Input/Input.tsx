import React from "react";
import "./Input.css";
import { ethers } from "ethers";
import { useConvertToAssets, useConvertToShares } from "../../hooks/useData";

interface IInputProps {
  amount: bigint;
}

const Input: React.FC<IInputProps> = ({ amount }) => {
  const shares = useConvertToShares(amount);

  const chosenValue =  shares.data ;
  const value = (+ethers.formatUnits(BigInt(shares.data  ?? BigInt(0)))).toFixed(2);

  // const value = ethers.commify(chosenValue);

  return <input type="number" disabled value={value} />;
};

export default Input;
