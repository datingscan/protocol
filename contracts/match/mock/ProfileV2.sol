// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.15;

import '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';

contract MockProfileV2 is Initializable {
  uint8 private constant VERSION = 2;

  function initializeProfile() public reinitializer(VERSION) {}

  function getVersion() public pure returns (uint256) {
    return VERSION;
  }
}
