const randomBytes = require('randombytes');
const axios = require('axios');
require('dotenv').config({ path: '../.env' });

const ClimateContract = artifacts.require('ClimateDAO');
const USDCStub = artifacts.require("USDCStub");

const { createWallet, getSignedTransaction, sendSignedTransaction, getInterface } = require('./ethers-local.js');
const { hexStringFromBuffer, signTransferAuthorization, signContributeAuthorization, getValueFromBN } = require('./utils.js');
const { MAX_UINT256, TEST_PROOF } = require('./constants.js');
const { contributeThenVote, setAuthorityPublicKeys, getTally, edwardsCompress, decTally, decFunding, checkTally } = require('../packages/api/src/elgamal.js');
const { shaHash } = require('../packages/api/src/lib/zkp-utils');
const { generalise } = require('../packages/api/src/lib/general-number');

// Tests contributing for 4 participants and tallying on-chain

contract('ClimateContract Tests', () => {

  // eslint-disable-next-line no-unused-vars
  const manualTally = (nestedVotes, contributionsOrVotes) => {
    // method to manually add up votes
    const tally = [
      { id: 1, amount: 0 },
      { id: 2, amount: 0 },
      { id: 3, amount: 0 },
      { id: 4, amount: 0 },
      { id: 5, amount: 0 }
    ];
    nestedVotes.forEach((voteSet) => {
      voteSet.forEach((vote) => {
        const projectTally = tally.find((obj) => obj.id === vote.id);
        projectTally.amount += contributionsOrVotes ? vote.amount : Math.floor(Math.sqrt(vote.amount) * 10 ** 6);
      });
    });
    return tally;
  };
  // Private key for encryption
  const x = '0xd18f22c4c73847502816bfae8364ec29ce06f6161d85cc3edd2dceda50f2dc';

  const owner = {
    address: process.env.ADMIN_ADDRESS,
    key: process.env.ADMIN_PRIVATE_KEY
  };

  const voters = [
    {
      address: '0xE657bf2Bf2576a39f593C9423c08c43766509213',
      key: '92587f4c85292a0507ff792a66d7c02b18d2cfa532dd828140427fb540e8e6ec'
    },
    {
      address: '0x4E4A4566613b9628E8f051012Be730B0f5FEdd39',
      key: '21916405c3ab18f63c309bd41cd188be84f9e88e4a6daed941a41f8afb69333c'
    },
    {
      address: '0xC1BD459e3C08D726FA7edC5671877C5a676C40e6',
      key: '15ab8b0f972675da5cde98bd41ec263d8a7ed047148d817c1c1cfaa2518850f5'
    },
    {
      address: '0xe55e2004082c312c6401403c808E796af8f8f425',
      key: 'bb2fca4570766102aabcc79e21acb910650cf6f641825dbc89e133a7d6fb2573'
    }
  ];

  const nonVoter = {
    address: '0x607543df950f75a1adcBe0784D343dBdD83a4BfA',
    key: 'dfef75db9155cf6447761385643ce7f0ffce5f668d47b630cc7f54d515da7845'
  };

  const projectSplit = [
    [
      { id: 1, amount: 0 },
      { id: 2, amount: 100000000 },
      { id: 3, amount: 100000000 },
      { id: 4, amount: 250000000 },
      { id: 5, amount: 50000000 }
    ],
    [
      { id: 1, amount: 175000000 },
      { id: 2, amount: 25000000 },
      { id: 3, amount: 25000000 },
      { id: 4, amount: 25000000 },
      { id: 5, amount: 250000000 }
    ],
    [
      { id: 1, amount: 100000000 },
      { id: 2, amount: 125000000 },
      { id: 3, amount: 25000000 },
      { id: 4, amount: 0 },
      { id: 5, amount: 250000000 }
    ],
    [
      { id: 1, amount: 50000000 },
      { id: 2, amount: 150000000 },
      { id: 3, amount: 175000000 },
      { id: 4, amount: 100000000 },
      { id: 5, amount: 25000000 }
    ],
  ];

  const expectedFunding = [
    { id: 1, amount: 325000000 },
    { id: 2, amount: 400000000 },
    { id: 3, amount: 325000000 },
    { id: 4, amount: 375000000 },
    { id: 5, amount: 575000000 }
  ];

  const expectedVoteTally = [
    { id: 1, amount: 30299824366 },
    { id: 2, amount: 38427788600 },
    { id: 3, amount: 33228756555 },
    { id: 4, amount: 30811388300 },
    { id: 5, amount: 43693844411 }
  ];

  const transferParams = voters.map(v => {
      return {
      from: v.address,
      value: 500000000,
      validAfter: 0,
      validBefore: MAX_UINT256,
    }
  });

  const db = [];
  // edit this for using an existing USDC contract
  const USDC_CONTRACT = '';
  const chainId = process.argv.find(elt => elt.includes('ropsten')) ? 3 : 333;
  let ClimateContractInstance;
  let USDCInstance;
  let nonceCopy;
  let Y;
  let tallies;

  it('User should be able to first vote off-chain', async () => {
    const calcFunding = manualTally(projectSplit, true);
    assert.deepEqual(calcFunding, expectedFunding);
    const calcTally = manualTally(projectSplit, false);
    assert.deepEqual(calcTally, expectedVoteTally);
    Y = setAuthorityPublicKeys(x);
    // we do not use the real db for this test
    // the api tests do
    projectSplit.forEach((v) => {
      db.push({ votes: contributeThenVote(v) });
    });
  });

  it('User should be able to contribute during voting period', async () => {
    // we need to redeploy each time, otherwise users will be blocked from voting again
    // and we need to test a full voting period
    ClimateContractInstance = await ClimateContract.deployed();
    try {
      // for when we are using an existing USDC contract
      USDCInstance = await USDCStub.at(USDC_CONTRACT);
    } catch (e) {
      // for when we are testing with one we deployed (usually in network=development)
      USDCInstance =  await USDCStub.deployed();
    }

    const usdcAddr = USDCInstance.address;
    const to = ClimateContractInstance.address;
    const initBalance = await USDCInstance.balanceOf.call(ClimateContractInstance.address);

    for (let i = 0; i < voters.length; i++) {

      const { from, value, validAfter, validBefore } = transferParams[i];

      const nonce = hexStringFromBuffer(randomBytes(32));
      nonceCopy = nonce;

      console.log(`Minting test ${value/10**6} USDC for ${from}`);

      try {
        await USDCInstance.magicMint(from, `${value}`, { from: owner.address });
      } catch (e) {
        console.log(e);
      }

      const { v, r, s } = await signTransferAuthorization(
        from,
        to,
        value,
        validAfter,
        validBefore,
        nonce,
        voters[i].key,
        usdcAddr
      );

      const { v: ownerSigV, r: ownerSigR, s: ownerSigS } = await signContributeAuthorization(
        ClimateContractInstance.address,
        from,
        value,
        nonce,
        owner.key
      );

      console.log(`Contributing ${value/10**6} USDC for ${from}`);
      let tx;
      try {
        tx = await ClimateContractInstance.contributeSigned(
          from,
          to,
          `${value}`,
          validAfter,
          validBefore,
          nonce,
          [v, r, s],
          [ownerSigV, ownerSigR, ownerSigS],
          { from: owner.address }
        );
      } catch (e) {
        console.log(e);
      }

      const eventValue = tx.logs[0].args.value;
      const balance = await USDCInstance.balanceOf.call(ClimateContractInstance.address);
      const aliceContribution = await ClimateContractInstance.getContributionOf.call(from);
      // assert that the contribution stored is the one emitted
      assert.equal(getValueFromBN(aliceContribution.words), getValueFromBN(eventValue.words));
      console.log(`Climate contract balance after vote ${i}`);
      console.log(`USDC ${getValueFromBN(balance.words) / 10**6}`);
    }

    const balance = await USDCInstance.balanceOf.call(ClimateContractInstance.address);
    // make sure that the contract balance is now 2000 USDC greater
    assert.equal(getValueFromBN(balance.words), getValueFromBN(initBalance.words) + 2000000000);
  });

  it('User should not be able to contribute more than once', async () => {
    // we use the same params from voter 0
    const { from, value, validAfter, validBefore } = transferParams[0];

    const nonce = hexStringFromBuffer(randomBytes(32));

    try {
      await USDCInstance.magicMint(from, `${value}`, { from: owner.address });
    } catch (e) {
      console.log(e);
    }

    const { v, r, s } = await signTransferAuthorization(
      from,
      ClimateContractInstance.address,
      value,
      validAfter,
      validBefore,
      nonce,
      voters[0].key,
      USDCInstance.address
    );

    const { v: ownerSigV, r: ownerSigR, s: ownerSigS } = await signContributeAuthorization(
      ClimateContractInstance.address,
      from,
      value,
      nonce,
      owner.key
    );

    let tx;

    try {
      await ClimateContractInstance.contributeSigned(
        from,
        ClimateContractInstance.address,
        `${value}`,
        validAfter,
        validBefore,
        nonce,
        [v, r, s],
        [ownerSigV, ownerSigR, ownerSigS],
        { from: owner.address }
      );
      throw null; // we want this to throw, but with a message
    } catch (e) {
      assert(e, "Expected a revert but did not get one");
      if (chainId === 333) {
        assert(e?.message.includes('already voted'), 'Tx failed for another reason');
      } else {
        assert(e?.message.includes('revert'), 'Tx failed for another reason');
      }
    }
  });

  it('User should not be able to contribute over USDC 9,999', async () => {
    const {validAfter, validBefore } = transferParams[0];
    const nonce = hexStringFromBuffer(randomBytes(32));
    // user signature
    const { v, r, s } = await signTransferAuthorization(
      nonVoter.address,
      ClimateContractInstance.address,
      20001*(10**6),
      validAfter,
      validBefore,
      nonce,
      nonVoter.key,
      USDCInstance.address
    );
    // The owner will NOT sign this in reality
    // But we test the failsafe contract functionality anyway
    const { v: ownerSigV, r: ownerSigR, s: ownerSigS } = await signContributeAuthorization(
      ClimateContractInstance.address,
      nonVoter.address,
      20001*(10**6),
      nonce,
      owner.key
    );
    try {
      if (chainId === 333) {
        await ClimateContractInstance.contributeSigned(
          nonVoter.address,
          ClimateContractInstance.address,
          20001*(10**6),
          validAfter,
          validBefore,
          nonce,
          [v, r, s],
          [ownerSigV, ownerSigR, ownerSigS],
          { from: nonVoter.address }
        )
      } else {
        const txData = getInterface(ClimateContractInstance.abi).encodeFunctionData('contributeSigned', [
          nonVoter.address,
          ClimateContractInstance.address,
          20001*(10**6),
          validAfter,
          validBefore,
          nonce,
          [v, r, s],
          [ownerSigV, ownerSigR, ownerSigS]
        ]);
        const rawTx = {
            to: ClimateContractInstance.address,
            data: txData,
            gasPrice: 50000000000,
            gasLimit: 6000000,
            chainId
        };
        const signedTx = await getSignedTransaction(rawTx, nonVoter.key);
        await sendSignedTransaction(signedTx);
      }
      throw null;
    } catch (e) {
      if (chainId === 333) {
        assert(e.message.includes('999'), 'Tx failed for another reason');
      } else {
        assert(e?.message.includes('failed'), 'Tx failed for another reason');
      }
    }
  });

  it('Non-admin user should not be able to cancel the voting', async () => {
    // check it's not already cancelled!
    assert.equal(await ClimateContractInstance.cancelled.call(), false);
    try {
      if (chainId === 333) {
        await ClimateContractInstance.cancel({ from: nonVoter.address });
      } else {
        const txData = getInterface(ClimateContractInstance.abi).encodeFunctionData('cancel', []);
        const rawTx = {
            to: ClimateContractInstance.address,
            data: txData,
            gasPrice: 40000000000,
            gasLimit: 6000000,
            chainId
        };
        const signedTx = await getSignedTransaction(rawTx, nonVoter.key);
        await sendSignedTransaction(signedTx);
      }
      throw null;
    } catch (e) {
      if (chainId === 333) {
        assert(e.message.includes('not owner'), 'Tx failed for another reason');
      } else {
        assert(e?.message.includes('failed'), 'Tx failed for another reason');
      }
    }
  });

  it('User should not be able to withdraw funds while active', async () => {
    // check it's not already cancelled!
    assert.equal(await ClimateContractInstance.cancelled.call(), false);
    try {
      if (chainId === 333) {
        await ClimateContractInstance.withdrawContribution({ from: voters[0].address });
      } else {
        const txData = getInterface(ClimateContractInstance.abi).encodeFunctionData('withdrawContribution', []);
        const rawTx = {
            to: ClimateContractInstance.address,
            data: txData,
            gasPrice: 40000000000,
            gasLimit: 6000000,
            chainId
        };
        const signedTx = await getSignedTransaction(rawTx, voters[0].key);
        await sendSignedTransaction(signedTx);
      }
      throw null;
    } catch (e) {
      if (chainId === 333) {
        assert(e.message.includes('cancelled'), 'Tx failed for another reason');
      } else {
        assert(e?.message.includes('failed'), 'Tx failed for another reason');
      }
    }
  });

  it('Non-admin user should not be able to cancel voting by calling cancelAndTransfer', async () => {
    console.log(`Calling cancelAndTransfer as user`);
    try {
      if (chainId === 333) {
        await ClimateContractInstance.cancelAndTransfer({ from: voters[0].address });
      } else {
        const txData = getInterface(ClimateContractInstance.abi).encodeFunctionData('cancelAndTransfer', []);
        const rawTx = {
            to: ClimateContractInstance.address,
            data: txData,
            gasPrice: 40000000000,
            gasLimit: 6000000,
            chainId
        };
        const signedTx = await getSignedTransaction(rawTx, voters[0].key);
        await sendSignedTransaction(signedTx);
      }
    } catch (e) {
      if (chainId === 333) {
        assert(e.message.includes('Caller is not owner'), 'Tx failed for another reason');
      } else {
        assert(e?.message.includes('failed') || e?.message.includes('revert'), 'Tx failed for another reason');
      }
    }
  });

  it('Non-admin user should not be able to cancel voting calling cancel method', async () => {
    console.log(`Calling cancelAndTransfer as user`);
    try {
      if (chainId === 333) {
        await ClimateContractInstance.cancel({ from: voters[0].address });
      } else {
        const txData = getInterface(ClimateContractInstance.abi).encodeFunctionData('cancelAndTransfer', []);
        const rawTx = {
            to: ClimateContractInstance.address,
            data: txData,
            gasPrice: 40000000000,
            gasLimit: 6000000,
            chainId
        };
        const signedTx = await getSignedTransaction(rawTx, voters[0].key);
        await sendSignedTransaction(signedTx);
      }
    } catch (e) {
      if (chainId === 333) {
        assert(e.message.includes('Caller is not owner'), 'Tx failed for another reason');
      } else {
        assert(e?.message.includes('failed') || e?.message.includes('revert'), 'Tx failed for another reason');
      }
    }
  });

  it('Admin should not be able to cancel voting by calling cancel method after matching pool + baseline has been transfered to contract', async () => {
    try {
      console.log(`Calling cancel as admin`);
      await ClimateContractInstance.cancel({ from: owner.address });
    } catch (e) {
      if (chainId === 333) {
        assert(e.message.includes('contract have matching pool'), 'Tx failed for another reason');
      } else {
        assert(e?.message.includes('failed') || e?.message.includes('revert'), 'Tx failed for another reason');
      }
    }
  });

  it('Admin should be able to cancel voting by calling cancelAndTransfer', async () => {
    // check it's not already cancelled!
    assert.equal(await ClimateContractInstance.cancelled.call(), false);
    try {
      console.log(`Calling cancelAndTransfer as admin`)
      await ClimateContractInstance.cancelAndTransfer({ from: owner.address });
    } catch (e) {
      throw new Error(e);
    }
    const project1Addr = await ClimateContractInstance.projects(1);
    const project1Bal = await USDCInstance.balanceOf.call(project1Addr);
    // this function should have stoppped the voting and distributed the matching pool + baseline funds evenly between projects
    assert.equal(getValueFromBN(project1Bal), 50000 * 1000000);
    assert.equal(await ClimateContractInstance.cancelled.call(), true);
  });

  it('Admin should not be able to cancel voting twice calling cancelAndTransfer', async () => {
    try {
      console.log(`Calling cancelAndTransfer as admin`);
      await ClimateContractInstance.cancel({ from: owner.address });
    } catch (e) {
      console.log("dfdfd", e.message)
      if (chainId === 333) {
        assert(e.message.includes('cancelled'), 'Tx failed for another reason');
      } else {
        assert(e?.message.includes('failed') || e?.message.includes('revert'), 'Tx failed for another reason');
      }
    }
  });

  it('User should be able to withdraw their contribution after cancellation', async () => {
    const initBalance = getValueFromBN(await USDCInstance.balanceOf.call(voters[0].address));
    try {
      if (chainId === 333) {
        await ClimateContractInstance.withdrawContribution({ from: voters[0].address });
      } else {
        const txData = getInterface(ClimateContractInstance.abi).encodeFunctionData('withdrawContribution', []);
        const rawTx = {
            to: ClimateContractInstance.address,
            data: txData,
            gasPrice: 40000000000,
            gasLimit: 6000000,
            chainId
        };
        const signedTx = await getSignedTransaction(rawTx, voters[0].key);
        await sendSignedTransaction(signedTx);
      }
    } catch (e) {
      throw new Error(e);
    }

    const balance = getValueFromBN(await USDCInstance.balanceOf.call(voters[0].address));
    assert.equal(initBalance + transferParams[0].value, balance);
  });

  it('Non-voters should not be able to call withdraw', async () => {
    try {
      if (chainId === 333) {
        await ClimateContractInstance.withdrawContribution({ from: nonVoter.address });
      } else {
        const txData = getInterface(ClimateContractInstance.abi).encodeFunctionData('withdrawContribution', []);
        const rawTx = {
            to: ClimateContractInstance.address,
            data: txData,
            gasPrice: 40000000000,
            gasLimit: 6000000,
            chainId
        };
        const signedTx = await getSignedTransaction(rawTx, nonVoter.key);
        await sendSignedTransaction(signedTx);
      }
    } catch (e) {
      if (chainId === 333) {
        assert(e.message.includes('no balance'), 'Tx failed for another reason');
      } else {
        assert(e?.message.includes('failed'), 'Tx failed for another reason');
      }
    }
  });

});
