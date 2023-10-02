import { useEffect, useState } from "react";
import clsx from "clsx";

// Assets
import xdaiLogo from "../../assets/xdai.svg";
import wxdaiLogo from "../../assets/wxdai.svg";

// Types
export type Token = {
  name: string;
  image: string;
};

export type TokenSelectorProps = {
  tokens?: Token[];
  onSelected: (token: Token) => void;
};

// Default config
const TOKENS = [
  {
    name: "xDAI",
    image: xdaiLogo,
  },
  {
    name: "WXDAI",
    image: wxdaiLogo,
  },
];

export const TokenSelector: React.FC<TokenSelectorProps> = ({ tokens = TOKENS, onSelected }) => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Token>(tokens[0]);

  const doSelect = (token: Token) => {
    setSelected(token);
    setOpen(false);
    onSelected(token);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => doSelect(tokens[0]), []);

  return (
    <div>
      <button
        className="flex-shrink-0 z-10 inline-flex items-center p-1 text-lg font-medium text-center text-[#45433C] bg-[#F3F0EA] border border-[#DDDAD0] rounded-full hover:bg-[#DDDAD0]"
        type="button"
        onClick={() => setOpen(open => !open)}
      >
        <img className="w-6" src={selected.image} alt={selected.name} />
        <span className="mx-2">{selected.name}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4 mr-2"
          viewBox="0 0 16 16"
          fill="none"
        >
          <path
            d="M13 5.5L8 10.5L3 5.5"
            stroke="#7A776D"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <div
        className={clsx(
          "absolute z-10 bg-white divide-y divide-gray-100 rounded-lg shadow w-28 mt-2",
          !open && "hidden",
        )}
      >
        <ul className="py-2 text-sm text-gray-700">
          {tokens.map(token => (
            <li key={token.name} onClick={() => doSelect(token)}>
              <button
                type="button"
                className="inline-flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <div className="inline-flex items-center">
                  <img className="w-6 mr-2" src={token.image} alt={token.name} />
                  {token.name}
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
