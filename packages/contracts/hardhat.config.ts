import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      evmVersion: "cancun",
    },
  },
  networks: {
    polygon: { url: process.env.POLYGON_RPC_URL || "", accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [] },
    base: { url: process.env.BASE_RPC_URL || "", accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [] }
  }
};
export default config;
