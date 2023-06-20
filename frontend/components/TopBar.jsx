import ConnectButton from "./ConnectButton";

const TopBar = () => {
  return (
    <div className="fixed top-0 w-full bg-gradient-to-r from-[#028f06]  to-[#055700]">
      <div className="relative flex w-full items-center px-4 py-2 shadow-xl">
        <span className="text-lg text-white drop-shadow-lg font-bold cursor-default">
          KERoulette
        </span>
        <div className="flex-grow"></div>
        <ConnectButton />
      </div>
    </div>
  );
};

export default TopBar;
