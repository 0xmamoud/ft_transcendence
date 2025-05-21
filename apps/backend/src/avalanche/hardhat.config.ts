import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
// import path from "path";

// dotenv.config({ path: path.resolve(__dirname, "../.env")})
 dotenv.config()
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    fuji: {
      url: "https://api.avax-test.network/ext/bc/C/rpc",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 43113
    },
  }
};
