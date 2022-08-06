// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.10;

import '../utils/Errors.sol';

import './IProfile.sol';
import './ProfileLib.sol';

// TODO: add docs, add proxy, add ownable interface, add pausable, check events are emitted, gas optimization
contract Profile is IProfile {
  mapping(address => ProfileLib.User) private usersByAddress;
  mapping(address => bool) private userExists;
  mapping(address => mapping(address => bool)) private matches;
  mapping(address => mapping(address => bool)) private userSeen;

  event UserCreated(address indexed addr, ProfileLib.User user);

  event UserUpdated(address indexed addr, ProfileLib.User user);

  event Match(address indexed user, address indexed matchUser);

  modifier isValidUserDataInput(ProfileLib.User memory user) {
    Errors.illegalValue(bytes(user.photo).length != 0);
    Errors.illegalValue(bytes(user.encryptedContact).length != 0);
    Errors.illegalValue(user.passions.length != 0 && user.passions.length < 6);
    Errors.illegalValue(
      bytes(user.location.lat).length != 0 &&
        bytes(user.location.lon).length != 0
    );

    for (uint256 index = 0; index < user.passions.length; index++) {
      string memory passion = user.passions[index];
      Errors.illegalValue(bytes(passion).length != 0);
    }

    _;
  }

  modifier isValidMatch(address user) {
    Errors.illegalValue(user != address(0));
    Errors.accessDenied(userExists[msg.sender]);
    Errors.accessDenied(userExists[user]);

    _;
  }

  function createProfile(ProfileLib.User calldata user)
    external
    override
    isValidUserDataInput(user)
  {
    Errors.accessDenied(!userExists[msg.sender]);

    usersByAddress[msg.sender] = user;
    userExists[msg.sender] = true;

    emit UserCreated(msg.sender, user);
  }

  function getUser(address userAddress)
    external
    view
    override
    returns (ProfileLib.User memory)
  {
    Errors.accessDenied(userExists[msg.sender]);

    return usersByAddress[userAddress];
  }

  function editProfile(ProfileLib.User memory update)
    external
    override
    isValidUserDataInput(update)
  {
    Errors.accessDenied(userExists[msg.sender]);

    ProfileLib.User storage user = usersByAddress[msg.sender];
    user.photo = update.photo;
    user.passions = update.passions;
    user.location = update.location;
    user.gender = update.gender;
    user.age = update.age;

    emit UserUpdated(msg.sender, user);
  }

  function like(address user)
    external
    override
    isValidMatch(user)
    returns (bool)
  {
    Errors.accessDenied(!userSeen[msg.sender][user]);

    matches[msg.sender][user] = true;
    userSeen[msg.sender][user] = true;

    bool mutulalMatch = isMatch(user);

    if (mutulalMatch) {
      emit Match(msg.sender, user);
    }

    return mutulalMatch;
  }

  function dislike(address user)
    external
    override
    isValidMatch(user)
    returns (bool)
  {
    Errors.accessDenied(!userSeen[msg.sender][user]);

    matches[msg.sender][user] = false;
    userSeen[msg.sender][user] = true;

    return false;
  }

  function isMatch(address user) public view returns (bool) {
    return
      matches[msg.sender][user] == true && matches[user][msg.sender] == true;
  }
}
