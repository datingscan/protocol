// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.15;

import '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';

import './Profile.sol';

contract ProfileV1 is Initializable, Profile {
  uint8 private constant VERSION = 1;

  function initializeProfile() public reinitializer(VERSION) {
    initialze();
  }

  function getVersion() public pure returns (uint256) {
    return VERSION;
  }
}
