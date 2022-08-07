import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import hre, { ethers } from 'hardhat';

import { Factories, ContractKeys } from '../../helpers/factory';
import { makeSuite } from '../../helpers/testing';
import { EAge, EGender } from '../../helpers/typings';
import { ProfileV1 } from '../../types';

makeSuite('contacts/match/Profile#Match', () => {
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
  });

  describe('like user', () => {
    it('should like user properly', async () => {
      await profile.createProfile(defaultUser).then((tx) => tx.wait());
      await profile
        .connect(user)
        .createProfile(defaultUser)
        .then((tx) => tx.wait());

      await profile.like(user.address).then((tx) => tx.wait());

      await expect(profile.connect(user).like(deployer.address)).to.emit(
        profile,
        'Match',
      );

      expect(await profile.isMatch(user.address)).to.equal(true);
      expect(await profile.connect(user).isMatch(deployer.address)).to.equal(
        true,
      );
    });

    it('should revert when like unregistered user', async () => {
      await profile.createProfile(defaultUser).then((tx) => tx.wait());

      await expect(profile.like(user.address)).reverted;
      expect(await profile.isMatch(user.address)).to.equal(false);
    });

    it('should revert when like unregistered user likes', async () => {
      await expect(profile.like(user.address)).reverted;
      expect(await profile.isMatch(user.address)).to.equal(false);
    });

    it('should revert when user tries like twice', async () => {
      await profile.createProfile(defaultUser).then((tx) => tx.wait());
      await profile
        .connect(user)
        .createProfile(defaultUser)
        .then((tx) => tx.wait());

      await profile.like(user.address).then((tx) => tx.wait());

      await expect(profile.like(user.address)).reverted;
    });
  });

  describe('dislike user', () => {
    it('should dislike user properly', async () => {
      await profile.createProfile(defaultUser).then((tx) => tx.wait());
      await profile
        .connect(user)
        .createProfile(defaultUser)
        .then((tx) => tx.wait());

      await profile.dislike(user.address).then((tx) => tx.wait());
      await profile
        .connect(user)
        .dislike(deployer.address)
        .then((tx) => tx.wait());

      expect(await profile.isMatch(user.address)).to.equal(false);
      expect(await profile.connect(user).isMatch(deployer.address)).to.equal(
        false,
      );
    });

    it('should revert when dislike unregistered user', async () => {
      await profile.createProfile(defaultUser).then((tx) => tx.wait());

      await expect(profile.dislike(user.address)).reverted;
      expect(await profile.isMatch(user.address)).to.equal(false);
    });

    it('should revert when dislike unregistered user likes', async () => {
      await expect(profile.dislike(user.address)).reverted;
      expect(await profile.isMatch(user.address)).to.equal(false);
    });

    it('should revert when user tries dislike twice', async () => {
      await profile.createProfile(defaultUser).then((tx) => tx.wait());
      await profile
        .connect(user)
        .createProfile(defaultUser)
        .then((tx) => tx.wait());

      await profile.dislike(user.address).then((tx) => tx.wait());

      await expect(profile.dislike(user.address)).reverted;
    });
  });
});
