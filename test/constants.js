const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const ZERO_BYTES32 = '0x0000000000000000000000000000000000000000000000000000000000000000';
const MAX_UINT256 = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
const vkJson = {
  "h": [
    [
      "0x180a0a546b31f699f7c4fdcebab6017fe1ed5d238f279273938f6d8fb4db513b",
      "0x082c4f5499418f26b0b7933aa7287ac2dfbb0c1b8209f38ff4740db6bde1ea9a"
    ],
    [
      "0x2302fe51204cf86f3bef6ac93b0774da6f3b283a4d81d1121589002be97c84e9",
      "0x129acdbefd5325e0f28f5a963e71c530eb124c3382a9d593a620c31d90b44300"
    ]
  ],
  "g_alpha": [
    "0x0c49df4f865a1f931eff933fb2729b3e97d850bbf0bc34aa67f3e06d983cb48b",
    "0x0b49130cd6bef0e00fec8dfb61ba11aad2442b96a50821d93923e58c1b0c0934"
  ],
  "h_beta": [
    [
      "0x077ef507264f2db92716eb3ff01a88181c79d29ac2ce6f919c98be75c7765eab",
      "0x2db188e49ed3b00806137dbc3a20098b63ff1a30652c05bf313d6baf6832c3b3"
    ],
    [
      "0x2958078f1b8508689e81be7c8801c6bbcdc6c226121e9b85e9f4eb980a9ec862",
      "0x261f267cb46832a340ef3e28a480ca42a97961f5567205e43b89d944e1208fde"
    ]
  ],
  "g_gamma": [
    "0x2699ed4a612254dbfb0da27621b49e21a2940c067136a1c754f6f40e70477252",
    "0x1d3beecd327a8b21f5ee75e7f5fd14f214928b6b1fd622c7a84fabcc6427c34d"
  ],
  "h_gamma": [
    [
      "0x180a0a546b31f699f7c4fdcebab6017fe1ed5d238f279273938f6d8fb4db513b",
      "0x082c4f5499418f26b0b7933aa7287ac2dfbb0c1b8209f38ff4740db6bde1ea9a"
    ],
    [
      "0x2302fe51204cf86f3bef6ac93b0774da6f3b283a4d81d1121589002be97c84e9",
      "0x129acdbefd5325e0f28f5a963e71c530eb124c3382a9d593a620c31d90b44300"
    ]
  ],
  "query": [
    [
      "0x05bbf38ede59331fd630ff78ecc23f9078003bac87d1b14c34e17e590f61f45d",
      "0x065a34fa222d28beb4b79e7a124c68bdc4fc7571b5c1e0194588c43a49ec1626"
    ],
    [
      "0x1e4e361e33a5105b6cb9e1c9eddda6b791da59f89530dd8dd95943f30ed3e688",
      "0x2dab754518cfa29ead65d07baf9afb1824651d525682fe244b5282132a8844a3"
    ]
  ]
};
const proofJson = {
  "proof": {
    "a": [
      "0x226929256aba50b254d1765c5a2d94e910495d0d41b9fb1f3d1865ddac4fb68c",
      "0x298222052a4bf87933bab018a21c174a7dc484eed12855eda094baab457fbd0a"
    ],
    "b": [
      [
        "0x1cb6846db81242913658578e950d2092f22967c6c5f15c2b5846272d5ef82b37",
        "0x129715ef6ecdcbe3bc7cb27db2d5b6500909cbceb1b526bb042947c906238547"
      ],
      [
        "0x046934c42bea121c3b5c56973a747610d3c5154a02ea921d40ec4e5320c6ea1c",
        "0x2c87d41e479439f2fae7f2ceea34db9e6d1bd2c9f5d1e7497ca8ba3aee1684ff"
      ]
    ],
    "c": [
      "0x2610940ad745623ed9f77cf428091b935834167301d0fb835e48b06767110f21",
      "0x1f5f54439510c8672e5d45e293533abe31da8e558e51b28eee6d5999ebecc2e4"
    ]
  },
  "inputs": [
    "0x00daaa85f7ae340375c2fc40c58030d57f0cc501a07e576bed701abe7bd09898"
  ]
};
const TEST_VK = Object.values(vkJson).flat(Infinity);
const TEST_PROOF = Object.values(proofJson.proof).flat(Infinity);
const USDC_CONTRACT = '0xCEBaD0cF51dfB7dA08Fc704f372a1a3136EBcEC6';
module.exports = {
  ZERO_ADDRESS,
  ZERO_BYTES32,
  MAX_UINT256,
  TEST_VK,
  TEST_PROOF,
  USDC_CONTRACT
};
