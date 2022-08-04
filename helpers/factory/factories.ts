import * as types from '../../types';

import { wrap } from './wrapper';

export const Factories = {
  Profile: wrap(types.Profile__factory),
};

export type TContactKey = keyof typeof Factories;

export const ContractKeys = Object.keys(Factories).reduce<
  Record<TContactKey, TContactKey>
>(
  (acc, key) => ({ ...acc, [key]: key }),
  {} as Record<TContactKey, TContactKey>,
);
