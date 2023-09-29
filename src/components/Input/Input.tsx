import React from "react";
import "./Input.css";
import { ethers } from "ethers";
import { useConvertToAssets, useConvertToShares } from "../../hooks/useData";

interface IInputProps {
  deposit: boolean;
  shares: bigint;
  assets: bigint;
}

const Input: React.FC<IInputProps> = ({ deposit, shares, assets }) => {
  const shares_ = useConvertToShares(assets);
  const assets_ = useConvertToAssets(shares);

  const chosenValue = deposit ? shares_.data : assets_.data;
  const value = (+ethers.formatUnits(BigInt(chosenValue ?? BigInt(0)))).toFixed(2);

  // const value = ethers.commify(chosenValue);

  return <input type="number" disabled value={value} />;
};

export default Input;
