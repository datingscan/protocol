export type ENetwork = EPolygonNetwork | EEthereumNetwork;

export enum EPolygonNetwork {
  MATIC = 'matic',
  MUMBAI = 'mumbai',
}

export enum EEthereumNetwork {
  GOERLI = 'goerli',
}

export enum EChainID {
  MATIC = 137,
  MUMBAI = 80001,
  GOERLI = 5,
}
