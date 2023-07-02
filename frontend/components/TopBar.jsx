import ConnectButton from "./ConnectButton";

const TopBar = () => {
  return (
    <div className="fixed top-0 w-full bg-gradient-to-r from-[#028f06]  to-[#055700]">
      <div className="relative flex w-full items-center px-4 py-2 shadow-xl xs:hidden">
        <span className="text-lg text-white drop-shadow-lg font-bold cursor-default">
          KERoulette
        </span>
        <div className="flex-grow flex items-center justify-center w-full">
              <a
              href="https://www.youtube.com/channel/UC_7OQZMa8eHONCjMklrYvZg"
              target="_blank"
              className="bg-[#000] rounded-full px-4 py-[2px]"
              >
                <p className="text-lg text-white font-mono font-semibold">VIDEO GUIDE</p>
              </a>
          </div>
        <ConnectButton />
      </div>
    </div>
  );
};

export default TopBar;
