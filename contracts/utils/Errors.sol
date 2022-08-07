// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.15;

library Errors {
  error AccessDenied();
  error IllegalValue();

  function accessDenied(bool ok) internal pure {
    if (!ok) {
      revert AccessDenied();
    }
  }

  function illegalValue(bool ok) internal pure {
    if (!ok) {
      revert IllegalValue();
    }
  }
}
