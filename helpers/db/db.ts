import { Contract } from 'ethers';
import low from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';

import path from 'path';

import { Address } from '../typings';

interface IData {
  [network: string]: {
    instance: Record<Address, Entity>;
    named: Record<string, NamedEntity>;
  };
}

interface Entity {
  id: string;
  address: Address;
  args: unknown[];
}

interface NamedEntity {
  address: Address;
}

const DB = low(
  new FileSync<IData>(
    path.resolve(__dirname, '../..', './deployed-contracts.json'),
  ),
);

DB.defaults({});

const IS_FORK = !!process.env.FORK;

export function saveEntity(
  name: string,
  network: string,
  contract: Contract,
  register?: boolean,
  args?: unknown[],
): void {
  const save = () => {
    DB.set(`${network}.instance.${contract.address}`, {
      id: name,
      address: contract.address,
      args,
    }).write();

    if (register) {
      DB.set(`${network}.named.${name}`, { address: contract.address }).write();
    }
  };

  if (['coverage', 'hardhat'].includes(network) && !IS_FORK) {
    save();
    return;
  }

  console.log(`*** ${name} ***\n`);
  console.log(`network: ${network}`);
  console.log(`contract address: ${contract.address}`);

  if (contract.deployTransaction) {
    console.log(`tx: ${contract.deployTransaction.hash}`);
    console.log(`nonce: ${contract.deployTransaction.nonce}`);
    console.log(`deployer address: ${contract.deployTransaction.from}`);
    console.log(
      `gas price: ${contract.deployTransaction.gasPrice?.toString() ?? ''}`,
    );
    console.log(`gas used: ${contract.deployTransaction.gasLimit?.toString()}`);
  }

  console.log(`\n******`);
  console.log();

  save();
}

export function getContractAddressByName(
  name: string,
  network: string,
): Address | null {
  const entity = DB.get(network).value();

  if (!entity) {
    return null;
  }

  const found = Object.values(entity.instance).find(({ id }) => id === name);

  return found?.address ?? null;
}

export function getEntityByAddress(
  id: Address,
  network: string,
): Entity | null {
  const entity = DB.get(network).value();

  return entity?.instance[id] ?? null;
}

export function clearDB(network: string): void {
  DB.set(network, undefined).write();
}
