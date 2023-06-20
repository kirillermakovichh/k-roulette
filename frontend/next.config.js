require("dotenv").config();
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",
}

module.exports = {
  target: "server",
  exportPathMap: async function (defaultPathMap) {
    return {
      "/": { page: "/index" },
      ...defaultPathMap,
    };
  },
  // env: {
  //   contractAddress: process.env.NEXT_PUBLIC_ROULLETE_ADDRESS,
  // },
  // async rewrites() {
  // return [
  //     {
  //       source: "/api/path/that/should/return/404",
  //       destination: "/404",
  //     },
  //   ]
  // },
  
}
