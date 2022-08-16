import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import hre, { ethers } from 'hardhat';

import { Factories, ContractKeys } from '../../helpers/factory';
import { makeSuite } from '../../helpers/testing';
import { EAge, EGender } from '../../helpers/typings';
import { ProfileV1 } from '../../types';

makeSuite('contacts/match/Profile#Profile', () => {
  let profile: ProfileV1;
  let deployer: SignerWithAddress;

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
    [deployer] = await ethers.getSigners();
    profile = await Factories.ProfileV1.connectAndDeploy(
      deployer,
      ContractKeys.ProfileV1,
      [],
      { register: false, network: hre.network.name },
    );

    await profile.initializeProfile().then((tx) => tx.wait());
  });

  describe('create new profile', () => {
    it('should create new profile for user', async () => {
      await expect(profile.createProfile(defaultUser)).to.emit(
        profile,
        'UserCreated',
      );

      const {
        photo,
        encryptedContact,
        passions,
        location,
        lat,
        lon,
        gender,
        age,
      } = await profile.getUser(deployer.address);

      expect(photo).to.equal(defaultUser.photo);
      expect(encryptedContact).to.equal(defaultUser.encryptedContact);
      expect(passions).to.deep.equal(defaultUser.passions);
      expect(gender).to.equal(defaultUser.gender);
      expect(age).to.equal(defaultUser.age);
      expect(location).to.equal(defaultUser.location);
      expect(lat).to.equal(defaultUser.lat);
      expect(lon).to.equal(defaultUser.lon);
    });

    it('should revert when creating new profile twice', async () => {
      const tx = await profile.createProfile(defaultUser);
      await tx.wait();

      await expect(profile.createProfile(defaultUser)).reverted;
    });

    it('should revert when creating new profile with invalid data', async () => {
      await expect(profile.createProfile({ ...defaultUser, photo: '' }))
        .reverted;

      await expect(
        profile.createProfile({ ...defaultUser, encryptedContact: '' }),
      ).reverted;

      await expect(profile.createProfile({ ...defaultUser, passions: [] }))
        .reverted;

      await expect(
        profile.createProfile({
          ...defaultUser,
          passions: ['1', '2', '3', '4', '5', '6'],
        }),
      ).reverted;

      await expect(
        profile.createProfile({
          ...defaultUser,
          passions: ['', '', '', '', ''],
        }),
      ).reverted;

      await expect(
        profile.createProfile({
          ...defaultUser,
          location: '',
          lat: '',
          lon: '',
        }),
      ).reverted;
    });
  });

  describe('edit profile', () => {
    const defaultUpdate = {
      encryptedContact: 'new-encrypted',
      photo: 'new-photo',
      passions: ['1', '2', '3'],
      gender: EGender.MALE,
      age: EAge.ELDER,
      lat: '1',
      lon: '2',
      location: 'City 1, State 1, Country 1',
    };

    it('should edit profile for user', async () => {
      const createTx = await profile.createProfile(defaultUser);
      await createTx.wait();

      await expect(profile.editProfile(defaultUpdate)).to.emit(
        profile,
        'UserUpdated',
      );

      const user = await profile.getUser(deployer.address);

      expect(user.photo).to.equal(defaultUpdate.photo);
      expect(user.encryptedContact).to.equal(defaultUser.encryptedContact);
      expect(user.passions).to.deep.equal(defaultUpdate.passions);
      expect(user.gender).to.equal(defaultUpdate.gender);
      expect(user.age).to.equal(defaultUpdate.age);
      expect(user.location).to.equal(defaultUpdate.location);
      expect(user.lat).to.equal(defaultUpdate.lat);
      expect(user.lon).to.equal(defaultUpdate.lon);
    });

    it('should revert when editing new profile with invalid data', async () => {
      await expect(profile.editProfile({ ...defaultUpdate, photo: '' }))
        .reverted;

      await expect(
        profile.editProfile({ ...defaultUpdate, encryptedContact: '' }),
      ).reverted;

      await expect(profile.editProfile({ ...defaultUpdate, passions: [] }))
        .reverted;

      await expect(
        profile.editProfile({
          ...defaultUpdate,
          passions: ['1', '2', '3', '4', '5', '6'],
        }),
      ).reverted;

      await expect(
        profile.editProfile({
          ...defaultUpdate,
          passions: ['', '', '', '', ''],
        }),
      ).reverted;

      await expect(
        profile.editProfile({
          ...defaultUpdate,
          location: '',
          lon: '',
          lat: '',
        }),
      ).reverted;
    });

    it('should revert when editing unregistered user', async () => {
      await expect(profile.editProfile(defaultUpdate)).reverted;
    });
  });
});
