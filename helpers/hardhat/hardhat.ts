import { HardhatRuntimeEnvironment } from 'hardhat/types';

import { EPolygonNetwork, ENetwork } from '../typings';

const GWEI = 1000 * 1000 * 1000;

export const NETWORKS_DEFAULT_GAS: Record<ENetwork, number> = {
  [EPolygonNetwork.MUMBAI]: gasPrice(1),
  [EPolygonNetwork.MATIC]: gasPrice(2),
};

export const NETWORKS_RPC_URL: Record<ENetwork, string> = {
  [EPolygonNetwork.MUMBAI]: 'https://rpc-mumbai.maticvigil.com',
  [EPolygonNetwork.MATIC]: 'https://rpc-mainnet.matic.network',
};

export const FORK_URLS: Record<ENetwork, string | undefined> = {
  [EPolygonNetwork.MATIC]: process.env.MATIC_ALCHEMY_KEY
    ? `https://polygon-mainnet.g.alchemy.com/v2/${process.env.MATIC_ALCHEMY_KEY}`
    : undefined,
  [EPolygonNetwork.MUMBAI]: process.env.MUMBAI_ALCHEMY_KEY
    ? `https://polygon-mumbai.g.alchemy.com/v2/${process.env.MUMBAI_ALCHEMY_KEY}`
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
