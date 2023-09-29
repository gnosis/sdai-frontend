import React, { useState, useEffect, useRef, KeyboardEvent, useCallback } from "react";
import "./Input.css";
import { ethers } from "ethers";

import { useConvertToAssets, useConvertToShares } from "../../hooks/useData";

interface IInputProps {
  deposit: boolean;
  shares: BigInt;
  assets: BigInt;
}

const Input: React.FC<IInputProps> = ({ deposit, shares, assets }) => {
  const shares_ = useConvertToShares(assets);
  const assets_ = useConvertToAssets(shares);

  const chosenValue = deposit ? shares_ : assets_;
  const value = (+ethers.formatUnits(BigInt(chosenValue))).toFixed(2);

  // const value = ethers.commify(chosenValue);

  return <input type="number" disabled value={value} />;
};

export default Input;
