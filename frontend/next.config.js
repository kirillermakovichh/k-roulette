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
}
