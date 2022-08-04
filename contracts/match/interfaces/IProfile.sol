// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.10;

interface IProfile {
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

  function createProfile(User calldata user) external;

  function getUser(address user) external view returns (User memory);

  function editProfile(User memory user) external;

  function like(address user) external returns (bool);

  function dislike(address user) external returns (bool);

  function isMatch(address user) external view returns (bool);

  // function getUsersForMatch() external view returns (User[] memory);

  // function submitContractReveal(address user, string calldata encryptedContact)
  //   external
  //   returns (bool);
}
