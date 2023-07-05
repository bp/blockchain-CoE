// SPDX-License-Identifier: MIT

pragma solidity 0.8.7;
contract USDCStub {

    mapping(address => uint256) internal balances;
    bytes32 public domain;

    constructor() {
      domain = keccak256(
        abi.encode(
            // keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)")
            0x8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f,
            keccak256(bytes('USD Coin')),
            keccak256(bytes('2')),
            3,
            address(this)
        )
      );
      balances[0xaE782688108DC82D3563fE4CA78c679aE9613Ec1] = 100000000000; // Alice
      balances[0x4Edd80557F2cc893de5397d0508efe7EcBa7B98d] = 100000000000; // Bob
      balances[0xE1b4eB313420cAc9da8C7D9c2197c758CEA1DDD0] = 100000000000; // Charlie

      balances[0xaa315870d29e57aE428382B0608c193846F1E7D4] = 100000000000; // infosec
      balances[0xC519264B3c1f9490Ed4AA6c410322D301F3c5fF7] = 100000000000; // infosec
      balances[0xc4255a5909D423EbaAa260588acE6dBBc76e03C8] = 100000000000; // infosec

    }

    function balanceOf(address account) external view returns (uint256) {
      return balances[account];
    }

    function magicMint(address account, uint256 amount) external returns (bool) {
      balances[account] += amount;
      return true;
    }

    function transfer(address recipient, uint256 amount) external returns (bool) {
      _transfer(msg.sender, recipient, amount);
      return true;
    }

    function receiveWithAuthorization(
        address from,
        address to,
        uint256 value,
        uint256 validAfter,
        uint256 validBefore,
        bytes32 nonce,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
      require(to == msg.sender, "FiatTokenV2: caller must be the payee");
      // _requireValidAuthorization(from, nonce, validAfter, validBefore);

      bytes memory data = abi.encode(
          0xd099cc98ef71107a616c4f0f941f04c322d8e254fe26b3c6668db87aae413de8,
          from,
          to,
          value,
          validAfter,
          validBefore,
          nonce
      );

      bytes32 digest = keccak256(
          abi.encodePacked(
              "\x19\x01",
              domain,
              keccak256(data)
          )
      );

      require(
          ecrecover(digest, v, r, s) == from,
          "FiatTokenV2: invalid signature"
      );
      _transfer(from, to, value);
    }

    function _transfer(
      address from,
      address to,
      uint256 value
    ) internal  {
      require(from != address(0), "ERC20: transfer from the zero address");
      require(to != address(0), "ERC20: transfer to the zero address");
      require(
        value <= balances[from],
        "ERC20: transfer amount exceeds balance"
      );

      balances[from] -= value;
      balances[to] += value;
      // emit Transfer(from, to, value);
    }
}
