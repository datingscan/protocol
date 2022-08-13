import { ethers } from 'hardhat';
import { task } from 'hardhat/config';

import { ContractKeys, Factories } from '../../helpers/factory';
import { getNetworkFromEnv } from '../../helpers/hardhat';

task('deploy:proxy-registry', 'Deploy ProxyRegistry contract').setAction(
  async (_, env) => {
    const [deployer] = await ethers.getSigners();
    const network = getNetworkFromEnv(env);

    await Factories.ProxyRegistry.connectAndDeploy(
      deployer,
      ContractKeys.ProxyRegistry,
      [],
      { register: true, network },
    );
  },
);
