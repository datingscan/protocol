import { formatBytes32String } from 'ethers/lib/utils';
import { ethers } from 'hardhat';
import { task } from 'hardhat/config';

import { saveEntity } from '../../helpers/db';
import { ContractKeys, Factories } from '../../helpers/factory';
import { getNetworkFromEnv } from '../../helpers/hardhat';

task('deploy:profile', 'Deploy Profile contract').setAction(async (_, env) => {
  const [deployer] = await ethers.getSigners();
  const network = getNetworkFromEnv(env);

  const proxyRegistry = Factories.ProxyRegistry.mustGet(
    deployer,
    ContractKeys.ProxyRegistry,
    { network },
  );

  const profileV1 = await Factories.ProfileV1.connectAndDeploy(
    deployer,
    ContractKeys.ProfileV1,
    [],
    { register: false, network },
  );

  await proxyRegistry
    .createProxy(
      profileV1.address,
      formatBytes32String(ContractKeys.Profile),
      profileV1.interface.encodeFunctionData('initializeProfile'),
    )
    .then((tx) => tx.wait());

  const proxiedProfileAddress = await proxyRegistry.getProxy(
    formatBytes32String(ContractKeys.Profile),
  );

  const proxiedProfile = Factories.Profile.attach(
    deployer,
    proxiedProfileAddress,
  );

  saveEntity(ContractKeys.Profile, network, proxiedProfile, true, [
    profileV1.interface.encodeFunctionData('initializeProfile'),
  ]);
});
