// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.15;

import '@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol';
import '@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol';

import '../utils/Errors.sol';
import '../utils/Strings.sol';

import './IProxyRegistry.sol';

// TODO: add docs
contract ProxyRegistry is ProxyAdmin, IProxyRegistry {
  mapping(bytes32 => address) private proxies;

  event ProxyCreated(
    address indexed proxy,
    address indexed impl,
    string name,
    bytes params
  );

  event ProxyUpdated(
    address indexed proxy,
    address indexed impl,
    string name,
    bytes params
  );

  function createProxy(
    address impl,
    bytes32 name,
    bytes memory params
  ) public override onlyOwner {
    Errors.illegalValue(impl != address(0));

    TransparentUpgradeableProxy proxy = new TransparentUpgradeableProxy(
      impl,
      address(this),
      params
    );

    proxies[name] = address(proxy);

    emit ProxyCreated(
      address(proxy),
      impl,
      string(Strings.toString(name)),
      params
    );
  }

  function upgradeProxy(
    address impl,
    bytes32 name,
    bytes calldata params
  ) public override onlyOwner {
    Errors.illegalValue(impl != address(0));

    address proxy = proxies[name];
    TransparentUpgradeableProxy(payable(proxy)).upgradeToAndCall(impl, params);

    emit ProxyUpdated(
      address(proxy),
      impl,
      string(Strings.toString(name)),
      params
    );
  }

  function getProxy(bytes32 name) public view override returns (address) {
    return proxies[name];
  }
}
