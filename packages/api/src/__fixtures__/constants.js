const CONSTANTS = {
  climateDaoContractAddress: '0x71399cC60b0fB7E19028ddD9cbd102500bbc5427',
  chainId: 3,
  usdcContractAddress: '0x3063CCA9ae539b99063890e98C90b66f3C50fef6',
  contribution: 1000000,
  vote: [
    {
      id: '1',
      amount: 1000000
    },
    {
      id: '2',
      amount: 0
    },
    {
      id: '3',
      amount: 0
    },
    {
      id: '4',
      amount: 0
    },
    {
      id: '5',
      amount: 0
    }
  ]
};

const vkJson = {
  h: [
    [
      '0x180a0a546b31f699f7c4fdcebab6017fe1ed5d238f279273938f6d8fb4db513b',
      '0x082c4f5499418f26b0b7933aa7287ac2dfbb0c1b8209f38ff4740db6bde1ea9a'
    ],
    [
      '0x2302fe51204cf86f3bef6ac93b0774da6f3b283a4d81d1121589002be97c84e9',
      '0x129acdbefd5325e0f28f5a963e71c530eb124c3382a9d593a620c31d90b44300'
    ]
  ],
  g_alpha: [
    '0x0c49df4f865a1f931eff933fb2729b3e97d850bbf0bc34aa67f3e06d983cb48b',
    '0x0b49130cd6bef0e00fec8dfb61ba11aad2442b96a50821d93923e58c1b0c0934'
  ],
  h_beta: [
    [
      '0x077ef507264f2db92716eb3ff01a88181c79d29ac2ce6f919c98be75c7765eab',
      '0x2db188e49ed3b00806137dbc3a20098b63ff1a30652c05bf313d6baf6832c3b3'
    ],
    [
      '0x2958078f1b8508689e81be7c8801c6bbcdc6c226121e9b85e9f4eb980a9ec862',
      '0x261f267cb46832a340ef3e28a480ca42a97961f5567205e43b89d944e1208fde'
    ]
  ],
  g_gamma: [
    '0x2699ed4a612254dbfb0da27621b49e21a2940c067136a1c754f6f40e70477252',
    '0x1d3beecd327a8b21f5ee75e7f5fd14f214928b6b1fd622c7a84fabcc6427c34d'
  ],
  h_gamma: [
    [
      '0x180a0a546b31f699f7c4fdcebab6017fe1ed5d238f279273938f6d8fb4db513b',
      '0x082c4f5499418f26b0b7933aa7287ac2dfbb0c1b8209f38ff4740db6bde1ea9a'
    ],
    [
      '0x2302fe51204cf86f3bef6ac93b0774da6f3b283a4d81d1121589002be97c84e9',
      '0x129acdbefd5325e0f28f5a963e71c530eb124c3382a9d593a620c31d90b44300'
    ]
  ],
  query: [
    [
      '0x05bbf38ede59331fd630ff78ecc23f9078003bac87d1b14c34e17e590f61f45d',
      '0x065a34fa222d28beb4b79e7a124c68bdc4fc7571b5c1e0194588c43a49ec1626'
    ],
    [
      '0x1e4e361e33a5105b6cb9e1c9eddda6b791da59f89530dd8dd95943f30ed3e688',
      '0x2dab754518cfa29ead65d07baf9afb1824651d525682fe244b5282132a8844a3'
    ]
  ]
};

module.exports = { CONSTANTS, vkJson };
