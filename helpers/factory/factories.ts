import * as types from '../../types';

import { wrap } from './wrapper';

export const Factories = {
  ProxyRegistry: wrap(types.ProxyRegistry__factory),
  ProfileV1: wrap(types.ProfileV1__factory),
  MockProfileV2: wrap(types.MockProfileV2__factory),
  Profile: wrap(types.ProfileV1__factory),
};

export type TContactKey = keyof typeof Factories;

export const ContractKeys = Object.keys(Factories).reduce<
  Record<TContactKey, TContactKey>
>(
  (acc, key) => ({ ...acc, [key]: key }),
  {} as Record<TContactKey, TContactKey>,
);
