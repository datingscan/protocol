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
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  const defaultUser = {
    photo: 'photo',
    encryptedContact: 'encrypted',
    passions: ['#crypto', '#ethereum', '#hodl'],
    location: 'City, State, Country',
    lat: '0',
    lon: '0',
    gender: EGender.FEMALE,
    age: EAge.BATTLE_SEASONED,
  };

  before(async () => {
    [deployer, user1, user2] = await ethers.getSigners();
    profile = await Factories.ProfileV1.connectAndDeploy(
      deployer,
      ContractKeys.ProfileV1,
      [],
      { register: false, network: hre.network.name },
    );

    await profile.initializeProfile().then((tx) => tx.wait());
  });

  describe('like user', () => {
    it('should like user properly', async () => {
      await profile.createProfile(defaultUser).then((tx) => tx.wait());
      await profile
        .connect(user1)
        .createProfile(defaultUser)
        .then((tx) => tx.wait());

      await profile.like(user1.address, true).then((tx) => tx.wait());

      await expect(profile.connect(user1).like(deployer.address, true)).to.emit(
        profile,
        'Match',
      );

      expect(await profile.isMatch(user1.address)).to.equal(true);
      expect(await profile.connect(user1).isMatch(deployer.address)).to.equal(
        true,
      );
    });

    it('should revert when like unregistered user', async () => {
      await profile.createProfile(defaultUser).then((tx) => tx.wait());

      await expect(profile.like(user1.address, true)).reverted;
      expect(await profile.isMatch(user1.address)).to.equal(false);
    });

    it('should revert when users like themselves', async () => {
      await profile.createProfile(defaultUser).then((tx) => tx.wait());

      await expect(profile.like(deployer.address, true)).reverted;
    });

    it('should revert when like unregistered user likes', async () => {
      await expect(profile.like(user1.address, true)).reverted;
      expect(await profile.isMatch(user1.address)).to.equal(false);
    });

    it('should revert when user tries like twice', async () => {
      await profile.createProfile(defaultUser).then((tx) => tx.wait());
      await profile
        .connect(user1)
        .createProfile(defaultUser)
        .then((tx) => tx.wait());

      await profile.like(user1.address, true).then((tx) => tx.wait());

      await expect(profile.like(user1.address, true)).reverted;
    });
  });

  describe('dislike user', () => {
    it('should dislike user properly', async () => {
      await profile.createProfile(defaultUser).then((tx) => tx.wait());
      await profile
        .connect(user1)
        .createProfile(defaultUser)
        .then((tx) => tx.wait());

      await profile.like(user1.address, false).then((tx) => tx.wait());
      await profile
        .connect(user1)
        .like(deployer.address, false)
        .then((tx) => tx.wait());

      expect(await profile.isMatch(user1.address)).to.equal(false);
      expect(await profile.connect(user1).isMatch(deployer.address)).to.equal(
        false,
      );
    });

    it('should revert when dislike unregistered user', async () => {
      await profile.createProfile(defaultUser).then((tx) => tx.wait());

      await expect(profile.like(user1.address, false)).reverted;
      expect(await profile.isMatch(user1.address)).to.equal(false);
    });

    it('should revert when users dislike themselves', async () => {
      await profile.createProfile(defaultUser).then((tx) => tx.wait());

      await expect(profile.like(deployer.address, false)).reverted;
    });

    it('should revert when dislike unregistered user likes', async () => {
      await expect(profile.like(user1.address, false)).reverted;
      expect(await profile.isMatch(user1.address)).to.equal(false);
    });

    it('should revert when user tries dislike twice', async () => {
      await profile.createProfile(defaultUser).then((tx) => tx.wait());
      await profile
        .connect(user1)
        .createProfile(defaultUser)
        .then((tx) => tx.wait());

      await profile.like(user1.address, false).then((tx) => tx.wait());

      await expect(profile.like(user1.address, false)).reverted;
    });
  });

  describe('like count', () => {
    before(async () => {
      await expect(
        profile.connect(deployer).createProfile(defaultUser),
      ).to.emit(profile, 'UserCreated');

      await expect(profile.connect(user1).createProfile(defaultUser)).to.emit(
        profile,
        'UserCreated',
      );

      await expect(profile.connect(user2).createProfile(defaultUser)).to.emit(
        profile,
        'UserCreated',
      );

      await profile
        .connect(deployer)
        .setLikeCount(1)
        .then((tx) => tx.wait());
    });

    it('should set like count properly', async () => {
      await expect(profile.connect(deployer).setLikeCount(0)).to.reverted;

      const remainingLikes = await profile.getRemainingLikesCount();
      expect(remainingLikes).to.equal(1);
    });

    it('should throw error if there are no likes remaining', async () => {
      await profile
        .connect(deployer)
        .like(user1.address, true)
        .then((tx) => tx.wait());

      const remainingLikes = await profile
        .connect(deployer)
        .getRemainingLikesCount();
      expect(remainingLikes).to.equal(0);

      await expect(profile.connect(deployer).like(user2.address, true)).to
        .reverted;
    });

    it('should like properly when likes timeout passed', async () => {
      await profile
        .connect(deployer)
        .like(user1.address, true)
        .then((tx) => tx.wait());

      const remainingLikes = await profile
        .connect(deployer)
        .getRemainingLikesCount();
      expect(remainingLikes).to.equal(0);

      await ethers.provider.send('evm_increaseTime', [86600]);
      await ethers.provider.send('evm_mine', []);

      const newRemainingLikes = await profile
        .connect(deployer)
        .getRemainingLikesCount();
      expect(newRemainingLikes).to.equal(1);

      await profile
        .connect(deployer)
        .like(user2.address, false)
        .then((tx) => tx.wait());

      const finalRemainingLikes = await profile
        .connect(deployer)
        .getRemainingLikesCount();
      expect(finalRemainingLikes).to.equal(0);
    });
  });
});
