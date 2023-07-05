/* eslint-disable camelcase, prefer-const */
import assert from 'assert';
import utils from '../lib/zkp-utils';
import { generalise, GN } from '../lib/general-number';

import {
  contributeThenVote,
  setAuthorityPublicKeys,
  checkTally,
  edwardsCompress
} from '../elgamal.js';

const { shaHash, randomHex } = utils;
const votes = [];
const numVoters = 50;
// @dev We can change the above to any number of users:
// 20 : 22s
// 50 : 60s
// 100 : 115s
// 200 : 225s
// 500 : 565s

const truncHash = (binaryStr) => {
  while (binaryStr.length < 256) binaryStr = '0' + binaryStr;
  return binaryStr.slice(3);
};

const manualTally = (nestedVotes) => {
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
      projectTally.amount += vote.amount;
    });
  });
  return tally;
};

// eslint-disable-next-line no-unused-vars
const manualSqrtTally = (nestedVotes) => {
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
      projectTally.amount += Math.sqrt(vote.amount);
    });
  });
  return tally;
};

// eslint-disable-next-line no-unused-vars
const manualSqrtTallyWhole = (nestedVotes) => {
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
      projectTally.amount += Math.floor(Math.sqrt(vote.amount) * 10 ** 6);
    });
  });
  return tally;
};

// eslint-disable-next-line no-unused-vars
const manualSqTally = (nestedVotes) => {
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
      projectTally.amount += vote.amount ** 2;
    });
  });
  return tally;
};

const db = [];
// Auth keys:
const x = '0xd18f22c4c73847502816bfae8364ec29ce06f6161d85cc3edd2dceda50f2dc';
let Y;

/**
@dev This test purely tests the elgamal functionality
The methods above perform manual tallying operations
We compare those with encrypted tallying and decrypting
*/
// eslint-disable-next-line func-names
describe('Elgamal setup', function () {
  it('should set keys', () => {
    // console.log('Set keys');
    // eslint-disable-next-line no-unused-vars
    Y = setAuthorityPublicKeys(x);
    // console.log(Y);
  });

  it(`should set ${numVoters} random votes`, () => {
    for (var i = 0; i < numVoters; i++) {
      votes.push([
        { id: 1, amount: generalise(randomHex(1)).number * 10 ** 6 },
        { id: 2, amount: generalise(randomHex(1)).number * 10 ** 6 },
        { id: 3, amount: generalise(randomHex(1)).number * 10 ** 6 },
        { id: 4, amount: generalise(randomHex(1)).number * 10 ** 6 },
        { id: 5, amount: generalise(randomHex(1)).number * 10 ** 6 }
      ]);
    }
  });
});

// eslint-disable-next-line func-names
describe('Sqrt then Elgamal (floating sqrt)', function () {
  let floatingSqrts = [];
  let tallies = [];

  it('should sqrt votes and add to tally', () => {
    // const hexVotes = [];
    // console.log('Square rooting contributions');
    floatingSqrts = manualSqrtTallyWhole(votes);
    // console.log('Voting');
    votes.forEach((v) => {
      db.push({ votes: contributeThenVote(v) });
      // console.log(`Added vote: [${votes[i]}]`);
    });
  });

  it('should decrypt final tally', () => {
    tallies = checkTally(db);
    const manualFunding = manualTally(votes);
    tallies.forEach((proj) => {
      const realTally = floatingSqrts.find((obj) => obj.id === proj.id).amount;
      const realFunding = manualFunding.find((obj) => obj.id === proj.id).amount;
      assert.equal(proj.voteTally, realTally);
      assert.equal(proj.userFunding, realFunding);
    });

    // console.log(`Real tally (sum of votes):`);
    // console.table(manualSqrtTally(votes));
    console.log(`Decrypted tally (sum of votes x10^x):`);
    console.table(floatingSqrts);
    // console.log(`Real funding pool distribution:`);
    // console.table(manualTally(votes));
    console.log(`Decrypted funding pool distribution:`);
    console.table(manualFunding);

    // BELOW: for printing a witness input to the zkp circuit
    const rawPoints = [];
    const compressedPoints = [];
    tallies.forEach((tally) => {
      rawPoints.push(tally.uncompressedEncryptedTally.R);
      rawPoints.push(tally.uncompressedEncryptedTally.S);
      compressedPoints.push(tally.encryptedTally[0]);
      compressedPoints.push(tally.encryptedTally[1]);
    });
    tallies.forEach((tally) => {
      rawPoints.push(tally.uncompressedEncryptedFunding.R);
      rawPoints.push(tally.uncompressedEncryptedFunding.S);
      compressedPoints.push(tally.encryptedFunding[0]);
      compressedPoints.push(tally.encryptedFunding[1]);
    });

    const innerHash = generalise(shaHash(...compressedPoints));

    const outerHash = shaHash(
      ...[
        innerHash.hex(32),
        edwardsCompress(Y),
        generalise(tallies.map((obj) => obj.voteTally)).all.hex(8, 8),
        generalise(tallies.map((obj) => obj.userFunding)).all.hex(8, 8)
      ].flat(Infinity)
    );
    const rawAmounts = [];
    tallies.forEach((obj) => {
      rawAmounts.push(obj.voteTally);
    });
    tallies.forEach((obj) => {
      rawAmounts.push(obj.userFunding);
    });
    const truncatedHash = new GN(truncHash(generalise(outerHash).binary), 'binary');
    // eslint-disable-next-line no-unused-vars
    const witnessInput = [
      truncatedHash.integer,
      generalise(rawPoints.flat(Infinity)).all.integer,
      generalise(rawAmounts).all.integer,
      generalise(x).limbs(32, 8)
    ].flat(Infinity);

    // console.log(`Copy this for witness CLI input:`);
    // console.log(witnessInput.join(' '));
  });
});

// eslint-disable-next-line func-names
describe('Testing the admin checkTally function for matched funds', function () {
  it('should collate votes and calculate matched funds', () => {
    const tallies = checkTally(db);
    console.log(`Funding from users / from matchingPool via checkTally`);
    console.table(tallies, ['id', 'userFunding', 'matchedAmount']);
    let sum = 0;
    tallies.forEach((project) => {
      sum += project.matchedAmount;
    });
    // check the matched funds add to matchingPool
    let check;
    if (14998 <= Math.floor(sum) <= 150000) {
      check = true;
    } else {
      check = false;
    }
    assert.ok(check);
  });
});
