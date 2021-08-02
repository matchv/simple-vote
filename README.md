## Vote

Full-stack Web3 Engineering Assignment

### 1. Development Environment

- Node v14.17.1
- Truffle v5.2.6 (core: 5.2.6)
- Solidity - 0.7.5 (solc-js)
- react 17.0.2
- material-ui 4.12.3
- Web3.js 1.5.0
- Rinkeby Test Network

### 2. Run the project

#### 2.1. Clone code and install dependencies

```bash
git clone this-project-code
```

```bash
cd /path/to/this/project/folder/
```

Run command to install package dependencies
```bash
yarn install
```

#### 2.2. Connect to rinkeby testnet

You should prepare an account which have enough ETH on rinkeby network.

#### 2.2.1. Create .env file

Copy .evn.example to root folder of project and renamed it as .env, you should fill values below:

- RINKEBY_RPC_URL  --- The rpc url of rinkeby network.
- RINKEBY_ACCOUNT  --- The account used to deploy contracts.
- RINKEBY_MNEMONIC --- The mnemonic, [Guide of reveal your Seed Phrase](https://metamask.zendesk.com/hc/en-us/articles/360015290032-How-to-reveal-your-Seed-Phrase-Secret-Recovery-Phrase).

#### 2.2.2. Make sure MetaMask connect to Rinkeby Test Network, and use the correct account. 

### 3. Compile, Deploy and Run

#### 3.1. Compile

You can now compile

```bash
yarn compile
```

#### 3.2 Deploy and Run

Open a new terminal

```bash
yarn run-project
```

Now the dapp is running, and you can interact with it.