import React, { useState, useEffect, useRef, KeyboardEvent, useCallback } from "react";
import "./Input.css";
import { ethers, BigNumber } from "ethers";

import {
    useConvertToAssets,
    useConvertToShares,
  } from "../../hooks/useData";

interface IInputProps {
  deposit: boolean;
  shares:BigNumber ;
  assets:BigNumber;
}


const Input: React.FC<IInputProps> = ({
    deposit,
    shares,
    assets,
    }) => {
    
      

    const shares_ =  useConvertToShares(assets)
    const assets_ =  useConvertToAssets(shares)

    const chosenValue = (deposit ? shares_ : assets_);


        const value = (+ethers.utils.formatUnits(BigNumber.from(chosenValue))).toFixed(2)
    

   // const value = ethers.utils.commify(chosenValue);
         
  return (
    <input type="number" disabled value={value} />
  );
};

export default Input;
