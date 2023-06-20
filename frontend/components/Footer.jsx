import { ImLinkedin } from "react-icons/im";
const Footer = () => {
  return (
    <div className="flex w-full justify-between items-center px-4 py-4 border-t border-solid border-t-black shadow-2xl bg-gradient-to-r from-[#077700] from-50% to-[#028f06]">
      <a
        href="https://www.linkedin.com/in/kirill-ermakovich-b80989264/"
        className="flex items-center"
      >
        <ImLinkedin color="white"/>
        <p className="text-sm text-white ml-[4px]">My LinkedIn</p>
      </a>
      <p className="text-sm text-white cursor-default">Kirill Ermakovich 2023©</p>
    </div>
  );
};

export default Footer;
