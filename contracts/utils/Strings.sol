// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.15;

library Strings {
  function trimRight(bytes memory str) internal pure returns (bytes memory) {
    uint256 i = str.length;

    while (i > 0 && str[i - 1] <= 0x20) {
      i--;
    }

    // solhint-disable-next-line no-inline-assembly
    assembly {
      mstore(str, i)
    }

    return str;
  }

  function toString(bytes32 data) internal pure returns (string memory) {
    return string(trimRight(abi.encodePacked(data)));
  }
}
