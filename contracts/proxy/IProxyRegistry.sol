// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.15;

interface IProxyRegistry {
  function createProxy(
    address impl,
    bytes32 name,
    bytes memory params
  ) external;

  function upgradeProxy(
    address impl,
    bytes32 name,
    bytes calldata params
  ) external;

  function getProxy(bytes32 name) external view returns (address);
}
