const randomBytes = require('randombytes');
const axios = require('axios');
require('dotenv').config({ path: '../.env' });

const ClimateContract = artifacts.require('ClimateDAO');
const USDCStub = artifacts.require("USDCStub");

const { createWallet, getInterface } = require('./ethers-local.js');
const { hexStringFromBuffer, signTransferAuthorization, signContributeAuthorization, getValueFromBN } = require('./utils.js');
const { MAX_UINT256, TEST_PROOF } = require('./constants.js');
const { contributeThenVote, setAuthorityPublicKeys, getTally, edwardsCompress, decTally, decFunding, checkTally } = require('../packages/api/src/elgamal.js');
const { shaHash } = require('../packages/api/src/lib/zkp-utils');
const { generalise } = require('../packages/api/src/lib/general-number');

// Tests contributing for 4 participants and tallying on-chain

contract('ClimateContract Tests', () => {

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
  let usdcAddr;
  let to;
  const { from, value, validAfter, validBefore } = transferParams[0];
  const nonce = hexStringFromBuffer(randomBytes(32));

  if (chainId === 3) {
    console.log('Note: This test will work only on the development network, since testnet has unpredictable tx confirmation times');
    return;
  }

  it('User should not be able to delay start time', async () => {
    ClimateContractInstance = await ClimateContract.deployed();
    to = ClimateContractInstance.address;
    try {
      // for when we are using an existing USDC contract
      USDCInstance = await USDCStub.at(USDC_CONTRACT);
    } catch (e) {
      // for when we are testing with one we deployed (usually in network=development)
      USDCInstance = await USDCStub.deployed();
    }
    usdcAddr = USDCInstance.address;
    // now + two minutes
    const newStartTime = Math.floor((Date.now() + 120000)/1000);
    try {
      await ClimateContractInstance.updateStartDate(newStartTime, { from: nonVoter.address });
    } catch (e) {
      if (chainId === 333) {
        assert(e.message.includes('Caller is not owner'), 'Tx failed for another reason');
      } else {
        assert(e?.message.includes('failed') || e?.message.includes('revert'), 'Tx failed for another reason');
      }
    }
  });

  it('Admin should not be able to update start time to a past time', async () => {
    // now - two minutes
    const newStartTime = Math.floor((Date.now() - 120000)/1000);
    try {
      await ClimateContractInstance.updateStartDate(newStartTime, { from: owner.address });
    } catch (e) {
      if (chainId === 333) {
        assert(e.message.includes('new start time in the past'), 'Tx failed for another reason');
      } else {
        assert(e?.message.includes('failed') || e?.message.includes('revert'), 'Tx failed for another reason');
      }
    }
  });

  it('Admin should be able to delay start time', async () => {
    // now + two minutes
    const newStartTime = Math.floor((Date.now() + 120000)/1000);
    try {
      await ClimateContractInstance.updateStartDate(newStartTime, { from: owner.address });
    } catch (e) {
      throw new Error(e);
    }
    let startTime = await ClimateContractInstance.startTime.call();
    if (startTime.words) startTime = getValueFromBN(startTime.words);
    assert.equal(newStartTime, startTime);
  });

  it('User should not be able to contribute before voting period', async () => {
    const startTime = await ClimateContractInstance.startTime.call();
    const now = Math.floor(Date.now()/1000);
    assert(now < startTime, 'Voting already started!');


    const initBalance = await USDCInstance.balanceOf.call(ClimateContractInstance.address);

    const { v, r, s } = await signTransferAuthorization(
      from,
      to,
      value,
      validAfter,
      validBefore,
      nonce,
      voters[0].key,
      usdcAddr
    );

    const { v: ownerSigV, r: ownerSigR, s: ownerSigS } = await signContributeAuthorization(
      ClimateContractInstance.address,
      from,
      value,
      nonce,
      owner.key
    );

    try {
      await ClimateContractInstance.contributeSigned(
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
      throw null; // we want this to throw, but with a message
    } catch (e) {
      assert(e, "Expected a revert but did not get one");
      if (chainId === 333) {
        assert(e?.message.includes('not started'), 'Tx failed for another reason');
      } else {
        assert(e?.message.includes('revert'), 'Tx failed for another reason');
      }
    }
  });

  it('Admin should be able to bring forward start time', async () => {
    // now + 20 secs
    const newStartTime = Math.floor((Date.now() + 20000)/1000);
    try {
      await ClimateContractInstance.updateStartDate(newStartTime, { from: owner.address });
    } catch (e) {
      throw new Error(e);
    }
    let startTime = await ClimateContractInstance.startTime.call();
    if (startTime.words) startTime = getValueFromBN(startTime.words);
    assert.equal(newStartTime, startTime);
    let now = Math.floor(Date.now()/1000);
    // wait for voting to end before sending tx
    if (now < startTime) console.log(`Waiting ${startTime-now}s for voting to start`);
    while (now < startTime) {
      now = Math.floor(Date.now()/1000);
    }
  });

  it('Admin should not be able to update start time once voting has been started', async () => {
    // now - two minutes
    const newStartTime = Math.floor((Date.now() + 120000)/1000);
    try {
      await ClimateContractInstance.updateStartDate(newStartTime, { from: owner.address });
    } catch (e) {
      if (chainId === 333) {
        assert(e.message.includes('voting already started'), 'Tx failed for another reason');
      } else {
        assert(e?.message.includes('failed') || e?.message.includes('revert'), 'Tx failed for another reason');
      }
    }
  });

  it('User should be able to contribute during voting period', async () => {

    console.log(`Minting test ${value/10**6} USDC for ${from}`);

    try {
      await USDCInstance.magicMint(from, `${value}`, { from: owner.address });
    } catch (e) {
      console.log(e);
    }

    const initBalance = await USDCInstance.balanceOf.call(ClimateContractInstance.address);

    const { v, r, s } = await signTransferAuthorization(
      from,
      to,
      value,
      validAfter,
      validBefore,
      nonce,
      voters[0].key,
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
    console.log(`Climate contract balance after vote`);
    console.log(`USDC ${getValueFromBN(balance.words) / 10**6}`);
  });

  it('Admin should be able to update end time', async () => {
    // now + 20 secs
    const newEndTime = Math.floor((Date.now() + 20000)/1000);
    try {
      await ClimateContractInstance.updateEndDate(newEndTime, { from: owner.address });
    } catch (e) {
      throw new Error(e);
    }
    let endTime = await ClimateContractInstance.endTime.call();
    if (endTime.words) endTime = getValueFromBN(endTime.words);
    assert.equal(newEndTime, endTime);
  });

  it('User should not be able to contribute after voting period', async () => {
    let endTime = await ClimateContractInstance.endTime.call();
    if (endTime.words) endTime = getValueFromBN(endTime.words);
    let now = Math.floor(Date.now()/1000);
    if(now < endTime) console.log(`Waiting ${endTime-now}s for voting to end`);
    // wait for voting to end before sending tx
    while (now <= endTime) {
      now = Math.floor(Date.now()/1000);
    }
    assert(now > endTime, 'Voting not complete!');

    const initBalance = await USDCInstance.balanceOf.call(ClimateContractInstance.address);

    const { v, r, s } = await signTransferAuthorization(
      from,
      to,
      value,
      validAfter,
      validBefore,
      nonce,
      voters[0].key,
      usdcAddr
    );

    const { v: ownerSigV, r: ownerSigR, s: ownerSigS } = await signContributeAuthorization(
      ClimateContractInstance.address,
      from,
      value,
      nonce,
      owner.key
    );

    try {
      await ClimateContractInstance.contributeSigned(
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
      throw null; // we want this to throw, but with a message
    } catch (e) {
      assert(e, "Expected a revert but did not get one");
      if (chainId === 333) {
        assert(e?.message.includes('has ended'), 'Tx failed for another reason');
      } else {
        assert(e?.message.includes('revert'), 'Tx failed for another reason');
      }
    }
  });
});
