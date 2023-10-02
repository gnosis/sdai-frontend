export const TokenInput: React.FC = () => {
  return (
    <div className="m-4">
      <div className="rounded-2xl border border-[#DDDAD0] bg-white p-6">
        <div className="flex justify-between items-center">
          <div className="text-3xl font-semibold">1,234</div>
          <div>
            <div className="flex">
              <button
                className="flex-shrink-0 z-10 inline-flex items-center p-1 text-lg font-medium text-center text-[#45433C] bg-[#F3F0EA] border border-[#DDDAD0] rounded-full hover:bg-[#DDDAD0]"
                type="button"
              >
                <img
                  className="w-6"
                  src="https://sdai.dev.gnosisdev.com/static/media/xdai.6575c1443409dab418abeba6fb0fa356.svg"
                  alt="WXDAI"
                />
                <span className="mx-2">xDAI</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 mr-2"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M13 5.5L8 10.5L3 5.5"
                    stroke="#7A776D"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </div>
            <div className="hidden absolute z-10 bg-white divide-y divide-gray-100 rounded-lg shadow w-28 mt-2">
              <ul
                className="py-2 text-sm text-gray-700"
                aria-labelledby="states-button"
              >
                <li>
                  <button
                    type="button"
                    className="inline-flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <div className="inline-flex items-center">
                      <img
                        className="w-6 mr-2"
                        src="https://sdai.dev.gnosisdev.com/static/media/xdai.6575c1443409dab418abeba6fb0fa356.svg"
                        alt="xDAI"
                      />
                      xDAI
                    </div>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className="inline-flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <div className="inline-flex items-center">
                      <img
                        className="w-6 mr-2"
                        src="https://sdai.dev.gnosisdev.com/static/media/Savings-xDAI.ccfc924f0ffefc081a8e4b979222e3c5.svg"
                        alt="sDAI"
                      />
                      sDAI
                    </div>
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="flex justify-between mt-2 items-center">
          <div className="text-[#999588] text-base font-semibold">0.0</div>
          <div className="text-xs text-[#7A776D]">
            <span className="font-medium">Balance 4,863.40</span>
            <span className="font-bold ml-2">Max</span>
          </div>
        </div>
      </div>
    </div>
  );
};
