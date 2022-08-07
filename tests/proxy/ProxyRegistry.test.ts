import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { formatBytes32String } from 'ethers/lib/utils';
import { ethers } from 'hardhat';

import { Factories, ContractKeys } from '../../helpers/factory';
import { makeSuite } from '../../helpers/testing';
import { ProfileV1, ProxyRegistry } from '../../types';

makeSuite('contacts/proxy/ProxyRegistry', () => {
  let profile: ProfileV1;
  let proxyRegistry: ProxyRegistry;
  let deployer: SignerWithAddress;

  const PROXY_TYPE = formatBytes32String('Profile');

  before(async () => {
    [deployer] = await ethers.getSigners();
    [proxyRegistry, profile] = await Promise.all([
      Factories.ProxyRegistry.connectAndDeploy(
        deployer,
        ContractKeys.ProxyRegistry,
        [],
      ),
      Factories.ProfileV1.connectAndDeploy(
        deployer,
        ContractKeys.ProfileV1,
        [],
      ),
    ]);
  });

  describe('create proxy', () => {
    it('should create proxy for profile', async () => {
      const version = await profile.getVersion();

      await expect(
        proxyRegistry.createProxy(
          profile.address,
          PROXY_TYPE,
          profile.interface.encodeFunctionData('initializeProfile'),
        ),
      ).to.emit(proxyRegistry, 'ProxyCreated');

      const proxy = await proxyRegistry.getProxy(
        formatBytes32String('Profile'),
      );
      expect(proxy).not.to.equal(ethers.constants.AddressZero);
      expect(version).to.equal(1);
    });

    it('should revert if implementation address is zero', async () => {
      await expect(
        proxyRegistry.createProxy(
          ethers.constants.AddressZero,
          PROXY_TYPE,
          profile.interface.encodeFunctionData('initializeProfile'),
        ),
      ).to.reverted;
    });
  });

  describe('upgrade proxy', () => {
    it('should upgrade proxy for profile', async () => {
      await proxyRegistry
        .createProxy(
          profile.address,
          PROXY_TYPE,
          profile.interface.encodeFunctionData('initializeProfile'),
        )
        .then((tx) => tx.wait());

      const profileV2 = await Factories.MockProfileV2.connectAndDeploy(
        deployer,
        ContractKeys.MockProfileV2,
        [],
      );
      const version = await profileV2.getVersion();

      await expect(
        proxyRegistry.upgradeProxy(
          profileV2.address,
          PROXY_TYPE,
          profile.interface.encodeFunctionData('initializeProfile'),
        ),
      ).to.emit(proxyRegistry, 'ProxyUpdated');

      const proxiedProfile = Factories.Profile.attach(
        deployer,
        await proxyRegistry.getProxy(PROXY_TYPE),
      );

      const profileVersion = await proxiedProfile.getVersion();
      expect(version).to.equal(profileVersion);
    });

    it('should revert if implementation address is zero', async () => {
      await expect(
        proxyRegistry.createProxy(
          profile.address,
          PROXY_TYPE,
          profile.interface.encodeFunctionData('initializeProfile'),
        ),
      ).to.emit(proxyRegistry, 'ProxyCreated');

      await expect(
        proxyRegistry.upgradeProxy(
          ethers.constants.AddressZero,
          PROXY_TYPE,
          profile.interface.encodeFunctionData('initializeProfile'),
        ),
      ).to.reverted;
    });
  });
});
