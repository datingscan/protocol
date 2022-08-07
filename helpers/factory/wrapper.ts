import { Contract, Signer } from 'ethers';

import { getContractAddressByName, saveEntity } from '../db';
import { Address } from '../typings';

import { FactoryConstructor, NamedDeployable, Options } from './types';

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
      { register, network }: Options,
    ): Promise<TResult> {
      const contract = await new F(deployer).deploy(...args);

      saveEntity(name, network, contract, register, args);

      return contract;
    }

    mustGet(deployer: Signer, name: string, { network }: Options): TResult {
      const address = getContractAddressByName(name, network);

      if (!address) {
        throw new Error(`${name} must be deployed`);
      }

      return this.attach(deployer, address);
    }

    attach(deployer: Signer, address: Address): TResult {
      const contract = new F(deployer).attach(address);

      return contract;
    }
  })();
}
