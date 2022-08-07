import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import hre, { ethers } from 'hardhat';

import { Factories, ContractKeys } from '../../helpers/factory';
import { makeSuite } from '../../helpers/testing';
import { EAge, EGender } from '../../helpers/typings';
import { ProfileV1 } from '../../types';

makeSuite('contacts/match/Profile#Deactivate', () => {
  let profile: ProfileV1;
  let deployer: SignerWithAddress;
  let user: SignerWithAddress;

  const defaultUser = {
    photo: 'photo',
    encryptedContact: 'encrypted',
    passions: ['#crypto', '#ethereum', '#hodl'],
    location: { lat: '0', lon: '0' },
    gender: EGender.FEMALE,
    age: EAge.BATTLE_SEASONED,
  };

  before(async () => {
    [deployer, user] = await ethers.getSigners();
    profile = await Factories.ProfileV1.connectAndDeploy(
      deployer,
      ContractKeys.ProfileV1,
      [],
      { register: false, network: hre.network.name },
    );

    await profile.initializeProfile().then((tx) => tx.wait());
  });

  describe('deactivate and activate profile', () => {
    it('should deactivate and activate profile for user', async () => {
      await expect(profile.connect(user).createProfile(defaultUser)).to.emit(
        profile,
        'UserCreated',
      );

      await profile
        .connect(deployer)
        .deactivateUser(user.address)
        .then((tx) => tx.wait());

      await expect(profile.connect(user).getUser(user.address)).to.reverted;

      await profile
        .connect(deployer)
        .activateUser(user.address)
        .then((tx) => tx.wait());

      const data = await profile.connect(user).getUser(user.address);

      expect(data.photo).to.equal(defaultUser.photo);
      expect(data.encryptedContact).to.equal(defaultUser.encryptedContact);
    });
  });
});
