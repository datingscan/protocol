import { HardhatRuntimeEnvironment } from 'hardhat/types';

import { EPolygonNetwork, ENetwork, EEthereumNetwork } from '../typings';

const GWEI = 1000 * 1000 * 1000;

export const NETWORKS_DEFAULT_GAS: Record<ENetwork, number | 'auto'> = {
  [EPolygonNetwork.MUMBAI]: gasPrice(2),
  [EPolygonNetwork.MATIC]: gasPrice(2),
  [EEthereumNetwork.GOERLI]: gasPrice(2),
};

export const NETWORKS_RPC_URL: Record<ENetwork, string | undefined> = {
  [EPolygonNetwork.MATIC]: 'https://rpc.ankr.com/polygon',
  [EPolygonNetwork.MUMBAI]: 'https://rpc.ankr.com/polygon_mumbai',
  [EEthereumNetwork.GOERLI]: process.env.GOERLI_INFURA_KEY
    ? `https://goerli.infura.io/v3/${process.env.GOERLI_INFURA_KEY}`
    : undefined,
};

export const FORK_URLS: Record<ENetwork, string | undefined> = {
  [EPolygonNetwork.MATIC]: process.env.MATIC_ALCHEMY_KEY
    ? `https://polygon-mainnet.g.alchemy.com/v2/${process.env.MATIC_ALCHEMY_KEY}`
    : undefined,
  [EPolygonNetwork.MUMBAI]: process.env.MUMBAI_ALCHEMY_KEY
    ? `https://polygon-mumbai.g.alchemy.com/v2/${process.env.MUMBAI_ALCHEMY_KEY}`
    : undefined,
  [EEthereumNetwork.GOERLI]: process.env.GOERLI_INFURA_KEY
    ? `https://goerli.infura.io/v3/${process.env.GOERLI_INFURA_KEY}`
    : undefined,
};

export function getNetworkFromEnv(env: HardhatRuntimeEnvironment): string {
  return process.env.FORK || env.network.name;
}

function gasPrice(def: number): number {
  return (
    (process.env.GAS_PRICE ? Number.parseInt(process.env.GAS_PRICE, 10) : def) *
    GWEI
  );
}
