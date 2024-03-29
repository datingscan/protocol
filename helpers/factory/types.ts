import { Contract, ContractFactory, Signer } from 'ethers';

import { Address } from '../typings';

export type FactoryConstructor<
  TDeployArgs extends unknown[],
  TResult extends Contract,
> = new (signer: Signer) => Deployable<TDeployArgs, TResult>;

export interface Options {
  network: string;
  register?: boolean;
}

export interface NamedDeployable<
  TArgs extends unknown[] = unknown[],
  TResult extends Contract = Contract,
> {
  attach(deployer: Signer, address: Address): TResult;
  mustGet(deployer: Signer, name: string, options: Options): TResult;
  connectAndDeploy(
    deployer: Signer,
    name: string,
    args: TArgs,
    options: Options,
  ): Promise<TResult>;
}

export interface Deployable<
  TArgs extends unknown[] = unknown[],
  TResult extends Contract = Contract,
> extends ContractFactory {
  attach(address: Address): TResult;
  deploy(...args: TArgs): Promise<TResult>;
}
