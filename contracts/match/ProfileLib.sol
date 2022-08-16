// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.15;

import '../utils/Errors.sol';

library ProfileLib {
  struct User {
    string photo;
    string encryptedContact;
    string[] passions;
    string location;
    string lat;
    string lon;
    EGender gender;
    EAge age;
  }

  enum EGender {
    FEMALE,
    MALE,
    OTHER
  }

  enum EAge {
    DOG_FACE,
    BATTLE_SEASONED,
    ELDER
  }
}
