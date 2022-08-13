// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.15;

import '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol';

import '../utils/Errors.sol';

import './IProfile.sol';
import './ProfileLib.sol';

// TODO: add docs, gas optimization, hide matches from user
contract Profile is IProfile, OwnableUpgradeable, PausableUpgradeable {
  uint256 private maxLikeCount;
  uint32 private constant BLOCK_OFFSET = 86400;

  mapping(address => ProfileLib.User) private usersByAddress;
  mapping(address => bool) private userExists;
  mapping(address => mapping(address => bool)) private matches;
  mapping(address => mapping(address => bool)) private userSeen;
  mapping(address => bool) private deactivatedUsers;
  mapping(address => uint256) private likes;
  mapping(address => uint256) private likeTimestamps;

  event UserCreated(address indexed addr, ProfileLib.User user);

  event UserUpdated(address indexed addr, ProfileLib.User user);

  event Match(address indexed user, address indexed matchUser);

  modifier isValidUserDataInput(ProfileLib.User memory user) {
    _checkInvalidData(user);
    _;
  }

  modifier isValidMatch(address user) {
    _checkValidMatch(user);
    _;
  }

  modifier whenNotDeactivated(address user) {
    _checkDeactivated(user);
    _;
  }

  function initialze() internal {
    maxLikeCount = 5;

    __Ownable_init();
    __Pausable_init();
  }

  function createProfile(ProfileLib.User calldata user)
    external
    override
    isValidUserDataInput(user)
    whenNotPaused
  {
    Errors.accessDenied(!userExists[msg.sender]);

    usersByAddress[msg.sender] = user;
    userExists[msg.sender] = true;
    likes[msg.sender] = 0;

    emit UserCreated(msg.sender, user);
  }

  function getUser(address userAddress)
    external
    view
    override
    whenNotDeactivated(msg.sender)
    returns (ProfileLib.User memory)
  {
    return usersByAddress[userAddress];
  }

  function editProfile(ProfileLib.User memory update)
    external
    override
    isValidUserDataInput(update)
    whenNotDeactivated(msg.sender)
    whenNotPaused
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

  function _checkInvalidData(ProfileLib.User memory user) private pure {
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
  }

  function like(address user, bool isLike)
    external
    override
    isValidMatch(user)
    whenNotDeactivated(msg.sender)
    whenNotPaused
    returns (bool)
  {
    Errors.illegalValue(msg.sender != user);
    Errors.accessDenied(!userSeen[msg.sender][user]);

    if (likeTimestamps[msg.sender] + BLOCK_OFFSET < block.timestamp) {
      likes[msg.sender] = 0;
    }

    Errors.accessDenied(likes[msg.sender] < maxLikeCount);

    matches[msg.sender][user] = isLike;
    userSeen[msg.sender][user] = true;
    likes[msg.sender] += 1;
    likeTimestamps[msg.sender] = block.timestamp;

    bool mutulalMatch = isMatch(user);

    if (mutulalMatch) {
      emit Match(msg.sender, user);
    }

    return mutulalMatch;
  }

  function _checkValidMatch(address user) private view {
    Errors.illegalValue(user != address(0));
    Errors.accessDenied(userExists[msg.sender] && userExists[user]);
  }

  function _checkDeactivated(address user) private view {
    Errors.accessDenied(!deactivatedUsers[user]);
  }

  function isMatch(address user)
    public
    view
    whenNotDeactivated(msg.sender)
    returns (bool)
  {
    return
      matches[msg.sender][user] == true && matches[user][msg.sender] == true;
  }

  function getRemainingLikesCount() public view returns (uint256) {
    if (likeTimestamps[msg.sender] + BLOCK_OFFSET < block.timestamp) {
      return maxLikeCount;
    }

    return maxLikeCount - likes[msg.sender];
  }

  function activateUser(address user) external onlyOwner {
    deactivatedUsers[user] = false;
  }

  function deactivateUser(address user) external onlyOwner {
    deactivatedUsers[user] = true;
  }

  function setLikeCount(uint256 count) external onlyOwner {
    Errors.illegalValue(count > 0);
    maxLikeCount = count;
  }
}
