import { Contract, Signer } from 'ethers';

import { Address } from '../typings';

import { FactoryConstructor, NamedDeployable } from './types';

export function wrap<TArgs extends unknown[], TResult extends Contract>(
  f: FactoryConstructor<TArgs, TResult>,
): NamedDeployable<TArgs, TResult> {
  return wrapFactory(f);
}

export function wrapFactory<TArgs extends unknown[], TResult extends Contract>(
  F: FactoryConstructor<TArgs, TResult>,
): NamedDeployable<TArgs, TResult> {
  return new (class implements NamedDeployable<TArgs, TResult> {
    async connectAndDeploy(
      deployer: Signer,
      name: string,
      args: TArgs,
    ): Promise<TResult> {
      return new F(deployer).deploy(...args);
    }

    attach(deployer: Signer, address: Address): TResult {
      const contract = new F(deployer).attach(address);

      return contract;
    }
  })();
}
