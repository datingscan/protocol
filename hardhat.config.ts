import '@nomiclabs/hardhat-etherscan';
import '@nomiclabs/hardhat-waffle';
import '@typechain/hardhat';
import * as dotenv from 'dotenv';
import 'hardhat-abi-exporter';
import 'hardhat-contract-sizer';
import 'hardhat-gas-reporter';
import 'hardhat-storage-layout';
import { HardhatUserConfig } from 'hardhat/config';
import 'solidity-coverage';

import {
  FORK_URLS,
  NETWORKS_DEFAULT_GAS,
  NETWORKS_RPC_URL,
} from './helpers/hardhat';
import { EChainID, ENetwork, EPolygonNetwork } from './helpers/typings';
import './scripts/accounts';

dotenv.config();

const COVERAGE_CHAINID = 1337;
const BUIDLEREVM_CHAINID = 31337;
const HARDFORK = 'istanbul';
const MNEMONIC_PATH = "m/44'/60'/0'/0";
const MNEMONIC = process.env.MNEMONIC || '';
const DEFAULT_BLOCK_GAS_LIMIT = 7000000;
const DEFAULT_GAS_MUL = 2;
const FORK_NETWORK = process.env.FORK;
const IS_FORK = !!FORK_NETWORK;
const MNEMONIC_MAIN_PHRASE = IS_FORK ? MNEMONIC : process.env.MNEMONIC_MAIN;

const getCommonNetworkConfig = (
  networkName: ENetwork,
  networkId: EChainID,
  mnemonic?: string,
) => ({
  url: NETWORKS_RPC_URL[networkName],
  hardfork: HARDFORK,
  blockGasLimit: DEFAULT_BLOCK_GAS_LIMIT,
  gasMultiplier: DEFAULT_GAS_MUL,
  gasPrice: NETWORKS_DEFAULT_GAS[networkName],
  chainId: networkId,
  accounts: {
    mnemonic: mnemonic || MNEMONIC,
    path: MNEMONIC_PATH,
    initialIndex: 0,
    count: 20,
  },
});

const getForkConfig = (name: ENetwork) => ({
  url: FORK_URLS[name] ?? '',
  accounts: {
    mnemonic: MNEMONIC,
    path: MNEMONIC_PATH,
  },
});

const mainnetFork = () => {
  if (!FORK_NETWORK) {
    return undefined;
  }

  const url =
    FORK_URLS[FORK_NETWORK as ENetwork] ||
    NETWORKS_RPC_URL[FORK_NETWORK as ENetwork];

  if (!url) {
    throw new Error(`Unknown network to fork: ${FORK_NETWORK}`);
  }

  return { url };
};

const config: HardhatUserConfig = {
  solidity: '0.8.15',
  typechain: {
    outDir: './types',
    target: 'ethers-v5',
  },
  networks: {
    hardhat: {
      hardfork: HARDFORK,
      blockGasLimit: DEFAULT_BLOCK_GAS_LIMIT,
      gas: DEFAULT_BLOCK_GAS_LIMIT,
      chainId: BUIDLEREVM_CHAINID,
      gasPrice: 8_000_000_000,
      throwOnTransactionFailures: true,
      throwOnCallFailures: true,
      forking: mainnetFork(),
    },
    coverage: {
      url: 'http://localhost:8555',
      chainId: COVERAGE_CHAINID,
    },
    matic: getCommonNetworkConfig(
      EPolygonNetwork.MATIC,
      EChainID.MATIC,
      MNEMONIC_MAIN_PHRASE,
    ),
    mumbai: getCommonNetworkConfig(EPolygonNetwork.MUMBAI, EChainID.MUMBAI),
    matic_fork: getForkConfig(EPolygonNetwork.MATIC),
    mumbai_fork: getForkConfig(EPolygonNetwork.MUMBAI),
  },
  abiExporter: {
    path: './abi',
    clear: true,
    flat: true,
    spacing: 2,
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: 'USD',
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;
