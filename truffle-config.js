require("dotenv").config()
const HDWalletProvider = require("@truffle/hdwallet-provider");

module.exports = {
  contracts_directory: './contracts/',
  contracts_build_directory: './src/abis/',
  compilers: {
    solc: {
      version: "0.7.5",
      settings: {
        optimizer: {
          enabled: true,
          details: { yul: true }
        }
      }
    }
  },
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
      gas: 6712390
    },
    rinkeby: {
      provider: function () {
        return new HDWalletProvider(process.env.RINKEBY_MNEMONIC, process.env.RINKEBY_RPC_URL);
      },
      network_id: '4',
      gas: 7500000,
      gasPrice: 20000000000,
      from: process.env.RINKEBY_ACCOUNT,
      timeoutBlocks: 200,
      confirmations: 2,
      skipDryRun: true
    }
  }
};
