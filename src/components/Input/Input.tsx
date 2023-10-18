import { ethers } from "ethers";

// Hooks
import { useConvertToShares } from "../../hooks/useConvertToShares";

// Components
import "./Input.css";

interface IInputProps {
  amount: bigint;
}

const Input: React.FC<IInputProps> = ({ amount }) => {
  const shares = useConvertToShares(amount);
  const value = (+ethers.formatUnits(shares)).toFixed(2);

  return <input type="number" disabled value={value} />;
};

export default Input;
