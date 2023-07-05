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
const { generalise, GN } = require('../packages/api/src/lib/general-number');

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

  // Only voters[0] requires eth
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
  // Requires eth
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
    console.log(`Total project contribution split:`);
    const calcFunding = manualTally(projectSplit, true);
    assert.deepEqual(calcFunding, expectedFunding);
    console.log(expectedFunding);
    console.log(`Project vote split:`);
    const calcTally = manualTally(projectSplit, false);
    assert.deepEqual(calcTally, expectedVoteTally);
    console.log(calcTally);
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
    // make sure that the contract balance is now USDC 2000 greater
    assert.equal(getValueFromBN(balance.words), getValueFromBN(initBalance.words) + 2000000000);
  });

  it('User should not be able to contribute without a valid admin signature', async () => {
    // mint this user USDC so it doesn't fail for lack of funds
    try {
      await USDCInstance.magicMint(nonVoter.address, 20001*(10**6), { from: owner.address });
    } catch (e) {
      console.log(e);
    }
    const {validAfter, validBefore } = transferParams[0];
    const nonce = hexStringFromBuffer(randomBytes(32));
    // user signature
    const { v, r, s } = await signTransferAuthorization(
      nonVoter.address,
      ClimateContractInstance.address,
      500,
      validAfter,
      validBefore,
      nonce,
      nonVoter.key,
      USDCInstance.address
    );
    // FAKE admin sig
    const { v: ownerSigV, r: ownerSigR, s: ownerSigS } = await signContributeAuthorization(
      ClimateContractInstance.address,
      nonVoter.address,
      500,
      nonce,
      nonVoter.key // this should be the admin key
    );

    try {
      if (chainId === 333) {
        await ClimateContractInstance.contributeSigned(
          nonVoter.address,
          ClimateContractInstance.address,
          500,
          validAfter,
          validBefore,
          nonce,
          [v, r, s],
          [ownerSigV, ownerSigR, ownerSigS],
          { from: nonVoter.address }
        );
      } else {
        const txData = getInterface(ClimateContractInstance.abi).encodeFunctionData('contributeSigned', [
          nonVoter.address,
          ClimateContractInstance.address,
          500,
          validAfter,
          validBefore,
          nonce,
          [v, r, s],
          [ownerSigV, ownerSigR, ownerSigS]
        ]);
    
        const rawTx = {
            to: ClimateContractInstance.address,
            data: txData,
            gasPrice: 60000000000,
            gasLimit: 6000000,
            chainId
        };
        const signedTx = await getSignedTransaction(rawTx, nonVoter.key);
        await sendSignedTransaction(signedTx);
      }
      throw null;
    } catch (e) {
      if (chainId === 333) {
        assert(e.message.includes('Not signed by owner'), 'Tx failed for another reason');
      } else {
        // ropsten's failed transactions do not give a revert reason
        assert(e?.message.includes('failed'), 'Tx failed for another reason');
      }
  }
  });

  it('We should be able to decrypt off-chain via checkTally', async () => {
    tallies = checkTally(db);
    console.log(`Funding from users / from matchingPool via offchain checkTally`);
    console.table(tallies, ['id', 'userFunding', 'matchedAmount']);
    tallies.forEach((proj) => {
      const realTally = expectedVoteTally.find((obj) => obj.id === proj.id).amount;
      const realFunding = expectedFunding.find((obj) => obj.id === proj.id).amount;
      assert.equal(proj.voteTally, realTally);
      assert.equal(proj.userFunding, realFunding);
    });
  });

  let witnessInput;
  let outerHash;
  const projectsToFund = [];
  const compressedPoints = [];

  it('We should be able to generate a witness for decryption', async () => {
    tallies.forEach((proj, i) => {
      const obj = {
        id: generalise(proj.id).integer,
        tally: generalise(proj.voteTally).integer,
        funding: generalise(proj.userFunding).integer,
      };
      projectsToFund.push(obj);
    })

    // for generating a real proof:

    // fill an array with the plaintext tally and funding
    const rawAmounts = [];
    // fill an array with the encrypted points (both uncompressed for zkp and compressed for contract)
    const rawPoints = [];

    tallies.forEach((tally) => {
      rawAmounts.push(tally.voteTally);
      rawPoints.push(tally.uncompressedEncryptedTally.R);
      rawPoints.push(tally.uncompressedEncryptedTally.S);
      compressedPoints.push(tally.encryptedTally[0]);
      compressedPoints.push(tally.encryptedTally[1]);
    });
    tallies.forEach((tally) => {
      rawAmounts.push(tally.userFunding);
      rawPoints.push(tally.uncompressedEncryptedFunding.R);
      rawPoints.push(tally.uncompressedEncryptedFunding.S);
      compressedPoints.push(tally.encryptedFunding[0]);
      compressedPoints.push(tally.encryptedFunding[1]);
    });
    // calculate the publicInputHash
    const innerHash = generalise(shaHash(...compressedPoints)).hex(32);

    outerHash = shaHash(
      ...[
        innerHash,
        edwardsCompress(Y),
        generalise(tallies.map((obj) => obj.voteTally)).all.hex(8, 8),
        generalise(tallies.map((obj) => obj.userFunding)).all.hex(8, 8)
      ].flat(Infinity)
    );

    outerHash = generalise(outerHash).binary;
    while (outerHash.length < 256) outerHash = '0' + outerHash;
    outerHash = new GN(outerHash.slice(3), 'binary');
    // collate inputs for witness
    witnessInput = [
      outerHash.integer,
      generalise(rawPoints.flat(Infinity)).all.integer,
      generalise(rawAmounts).all.integer,
      generalise(x).limbs(32, 8)
    ].flat(Infinity);

    console.log(`Generating witness...`)

    try {
      let axiosConfig = {
            method: "post",
            url: `http://localhost:8001/witness`,
            headers: {
              "Content-Type": "application/json",
            },
            data: {
              folderpath: 'decrypt-tally-hash',
              inputs: witnessInput,
            },
            timeout: 3600000, // 1 hour
          };
      await axios(axiosConfig);
    } catch (e) {
      throw new Error(`Compute witness failed: ${e}`);
    }
    console.log(`Complete! A proof can be generated with this witness`);
  });

  let proof = TEST_PROOF;

  // @dev: we can skip this long step as long as the Verifier.verify call is commented out in the contract
  it('We should be able to generate a proof of decryption', async () => {
    console.log(`Generating proof - warning, this may take 10 mins+ !`);

    try {
      axiosConfig = {
            method: "post",
            url: `http://localhost:8001/proof`,
            headers: {
              "Content-Type": "application/json",
            },
            data: {
              folderpath: 'decrypt-tally-hash',
              inputs: witnessInput,
            },
            timeout: 3600000, // 1 hour
          };

      const { data } = await axios(axiosConfig);
      // we make sure that the proof's public input matches expected
      assert.equal(data.inputs[0], generalise(witnessInput[0]).hex(32));
      proof = data.proof;
    } catch (e) {
      throw new Error(`Proof generation failed: ${e}`);
    }
    proof = generalise(Object.values(proof).flat(Infinity)).all.integer;
});

it('Admin should not be able to initiate fund distribution before voting ends', async () => {
  let endTime = await ClimateContractInstance.endTime.call();
  if (endTime.words) endTime = getValueFromBN(endTime.words);
  const isOpen = Math.floor(Date.now()/1000) < endTime;
  assert(isOpen);
  try {
    await ClimateContractInstance.verifyThenDistribute(
         proof,
         [...projectsToFund].map(obj => Object.values(obj).flat(Infinity)),
         generalise(compressedPoints.slice(0, 10)).all.hex(32),
         generalise(compressedPoints.slice(10, 20)).all.hex(32),
         edwardsCompress(Y),
         { from: owner.address }
       );
    throw null; // we want this to throw, but with a message
  } catch (e) {
    assert(e, "Expected a revert but did not get one");
    if (chainId === 333) {
      assert(e?.message.includes('voting still open'), 'Tx failed for another reason');
    } else {
      assert(e?.message.includes('revert'), 'Tx failed for another reason');
    }
  }
});

it('Admin should be able to update end time', async () => {
  // now + 40 secs
  const newEndTime = Math.floor((Date.now() + 40000)/1000);
  try {
    await ClimateContractInstance.updateEndDate(newEndTime, { from: owner.address });
  } catch (e) {
    throw new Error(e);
  }
  let endTime = await ClimateContractInstance.endTime.call();
  if (endTime.words) endTime = getValueFromBN(endTime.words);
  assert.equal(newEndTime, endTime);
});

it('Non-admin user should not be able to initiate fund distribution', async () => {
  
  let endTime = await ClimateContractInstance.endTime.call();
  if (endTime.words) endTime = getValueFromBN(endTime.words);
  let now = Math.floor(Date.now()/1000);
  // wait for voting to end before sending tx
  if(now < endTime) console.log(`Waiting ${endTime-now}s for voting to end`);
  while (now < endTime) {
    now = Math.floor(Date.now()/1000);
  }

  try {
    if (chainId === 333) {
      await ClimateContractInstance.verifyThenDistribute(
        proof,
        [...projectsToFund].map(obj => Object.values(obj).flat(Infinity)),
        generalise(compressedPoints.slice(0, 10)).all.hex(32),
        generalise(compressedPoints.slice(10, 20)).all.hex(32),
        edwardsCompress(Y),
        { from: nonVoter.address }
      )
    } else {
      const txData = getInterface(ClimateContractInstance.abi).encodeFunctionData('verifyThenDistribute', [
        proof,
        [...projectsToFund].map(obj => Object.values(obj).flat(Infinity)),
        generalise(compressedPoints.slice(0, 10)).all.hex(32),
        generalise(compressedPoints.slice(10, 20)).all.hex(32),
        edwardsCompress(Y)
      ]);
      const rawTx = {
            to: ClimateContractInstance.address,
            data: txData,
            gasPrice: 60000000000,
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
      // ropsten's failed transactions do not give a revert reason
      assert(e?.message.includes('failed'), 'Tx failed for another reason');
    }
  }
});

it('Admin should not be able to pass in an incorrect tally', async () => {
  const badProjectsToFund = [];
  projectsToFund.forEach((obj) => {
    let newObj = { ...obj }; // clone each project
    newObj.tally = newObj.tally + 1;
    badProjectsToFund.push(newObj);
  });
  try {
    // all inputs are correct except tally
    await ClimateContractInstance.verifyThenDistribute(
         proof,
         badProjectsToFund.map(obj => Object.values(obj).flat(Infinity)),
         generalise(compressedPoints.slice(0, 10)).all.hex(32),
         generalise(compressedPoints.slice(10, 20)).all.hex(32),
         edwardsCompress(Y),
         { from: owner.address }
       );
    throw null; // we want this to throw, but with a message
  } catch (e) {
    assert(e, "Expected a revert but did not get one");
    assert(e?.message.includes('revert'), 'Tx failed for another reason');

  }
});

it('We should be able to verify and distribute on-chain', async () => {

    // below: useful logging to test zokrates directly in the CLI:

    // console.log(`Copy this for witness CLI input:`);
    // console.log(witnessInput.join(' '));

    // below: useful logging to test contract directly:

    let tx;

    // console.log(`copy this for solidity input:`)
    // console.log(
    //   outerHash.hex(32),
    //   proof,
    //   projectsToFund.map(obj => Object.values(obj).flat(Infinity)),
    //   generalise(compressedPoints.slice(0, 10)).all.hex(32),
    //   generalise(compressedPoints.slice(10, 20)).all.hex(32),
    //   edwardsCompress(Y),
    // );

    try {
      console.log(`Sending tally and proof to contract`);
      tx = await ClimateContractInstance.verifyThenDistribute(
           proof,
           projectsToFund.map(obj => Object.values(obj).flat(Infinity)),
           generalise(compressedPoints.slice(0, 10)).all.hex(32),
           generalise(compressedPoints.slice(10, 20)).all.hex(32),
           edwardsCompress(Y),
           { from: owner.address }
         );
    } catch (e) {
      throw new Error(e);
    }
    const infolog = [];
    // parse all distribution events for each project and fill a table
    tx?.logs.forEach((item, i) => {
      infolog.push({
        id: item.args.id.words[0],
        userContributions: item.args.funded.words[0],
        matchedFunds: item.args.matched.words[0],
        total: item.args.total.words[0]
      });
    });
    console.log(`Funding distributed from users / from matchingPool on chain`);
    console.table(infolog);
  });

  it('Admin should not be able to cancel after distribution by calling cancelAndTransfer', async () => {
    try {
      console.log(`Calling cancelAndTransfer as admin`)
      await ClimateContractInstance.cancelAndTransfer({ from: owner.address });
      throw null;
    } catch (e) {
      if (chainId === 333) {
        assert(e.message.includes('distribution already happened'), 'Tx failed for another reason');
      } else {
        assert(e?.message.includes('failed') || e?.message.includes('revert'), 'Tx failed for another reason');
      }
    }
  });
  it('User should not be able to cancel after distribution calling cancelAndTransfer', async () => {
    console.log(`Calling cancelAndTransfer as user`)
    try {
      if (chainId === 333) {
        await ClimateContractInstance.cancelAndTransfer({ from: nonVoter.address });
      } else {
        const txData = getInterface(ClimateContractInstance.abi).encodeFunctionData('cancelAndTransfer', []);
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
        assert(e.message.includes('Caller is not owner'), 'Tx failed for another reason');
      } else {
        assert(e?.message.includes('failed') || e?.message.includes('revert'), 'Tx failed for another reason');
      }
    }
  });
  it('User should not be able to cancel after distribution by calling cancel method', async () => {
    console.log(`Calling cancelAndTransfer as user`)
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
    } catch (e) {
      if (chainId === 333) {
        assert(e.message.includes('Caller is not owner'), 'Tx failed for another reason');
      } else {
        assert(e?.message.includes('failed') || e?.message.includes('revert'), 'Tx failed for another reason');
      }
    }
  });
});
