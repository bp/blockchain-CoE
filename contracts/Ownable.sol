// SPDX-License-Identifier: UNLICENSED

pragma solidity 0.8.7;

contract Ownable {
  address private _owner;

  constructor() {
    setOwner(msg.sender);
  }

  function owner() public view returns (address) {
    return _owner;
  }

  modifier onlyOwner() {
    require(msg.sender == owner(), 'Caller is not owner');
    _;
  }

  modifier onlyOwnerSigned(address _user) {
    require(_user == owner(), 'Not signed by owner');
    _;
  }

  function transferOwnerShip(address newOwner) external onlyOwner {
    require(newOwner != address(0), 'New owner is zero address');
    setOwner(newOwner);
  }

  function setOwner(address newOwner) internal {
    _owner = newOwner;
  }

}
