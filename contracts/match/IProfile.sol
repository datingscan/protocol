// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.15;

import './ProfileLib.sol';

interface IProfile {
  function createProfile(ProfileLib.User calldata user) external;

  function getUser(address user) external view returns (ProfileLib.User memory);

  function editProfile(ProfileLib.User memory user) external;

  function like(address user, bool isLike) external returns (bool);

  function isMatch(address user) external view returns (bool);

  // function getUsersForMatch() external view returns (ProfileLib.User[] memory);

  // function submitContractReveal(address user, string calldata encryptedContact)
  //   external
  //   returns (bool);
}
