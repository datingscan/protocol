// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.10;

import '../utils/Errors.sol';

library ProfileLib {
  struct User {
    string photo;
    string encryptedContact;
    string[] passions;
    Location location;
    EGender gender;
    EAge age;
  }

  struct Location {
    string lat;
    string lon;
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
