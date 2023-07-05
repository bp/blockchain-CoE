/**
functions to support Elgamal encryption over a BabyJubJub curve
Adapted from: https://github.com/EYBlockchain/nightlite/blob/master/elgamal.js
*/
const { ensure0x, randomHex } = require('./lib/zkp-utils');
const { generalise } = require('./lib/general-number');

const one = BigInt(1);
const zero = BigInt(0);

// BabyJubJub parameters:
const BABYJUBJUB = {
  JUBJUBP: BigInt('21888242871839275222246405745257275088548364400416034343698204186575808495617'),
  JUBJUBA: BigInt(168700),
  JUBJUBD: BigInt(168696),
  INFINITY: [BigInt(0), BigInt(1)],
  GENERATOR: [
    BigInt('16540640123574156134436876038791482806971768689494387082833631921987005038935'),
    BigInt('20819045374670962167435360035096875258406992893633759881276124905556507972311')
  ],
  JUBJUBORDER: BigInt(
    '21888242871839275222246405745257275088614511777268538073601725287587578984328'
  ),
  JUBJUBC: BigInt(8),
  MONTA: BigInt(168698),
  MONTB: BigInt(1)
};
const { JUBJUBP, JUBJUBORDER, JUBJUBC, JUBJUBD, JUBJUBA, GENERATOR } = BABYJUBJUB;
const Fp = BigInt(JUBJUBP); // the prime field used with the curve E(Fp)
const Fq = JUBJUBORDER / JUBJUBC; // subgroup of points order > 8

// Voting parameters (for testing)
let AUTHORITY_PRIVATE_KEY = process.env.ENC_SECRET || 0;
let AUTHORITY_PUBLIC_KEY = process.env.ENC_SECRET
  ? scalarMult(process.env.ENC_SECRET, GENERATOR)
  : [];
const accuracy = 10 ** 6;

/**
@dev The encryption algorithm:
@param v - a vote (already whole number, = sqrt(contribution)) or contribution
@param GENERATOR - G
@param AUTHORITY_PRIVATE_KEY - or x
@param AUTHORITY_PUBLIC_KEY - or xG = Y

To encrypt v, we first choose a random secret integer k for each vote.
Then we turn the vote into a point:
  V = vG
And calculate:
  R = kG, S = V + kY
(R,S) is the encrypted vote!
*/

/**
@dev The dencryption algorithm:
@param R
@param S - (R, S) is the encrypted vote / tally
@param GENERATOR - G
@param AUTHORITY_PRIVATE_KEY - or x
@param AUTHORITY_PUBLIC_KEY - or xG = Y

To decrypt (R, S) and find V we calculate:
  S - xR
  = V + kxG - kxG
  = V
Since v is small, we can brute force V to find v!
*/

/**
The contribute function
@dev This takes a user's contributions per project and:
 - calculates the user's votes (= rounded sqrt(contribution))
 - encrypted both the contributions and votes
 - returns an array of objects to store in our db
@param {Array(Object)} contributions - array of hex or integer strings (contributions) to encrypt indexed by projectId
*/
function contributeThenVote(_contributions) {
  // initialise vote array
  const votes = [];
  const contributions = [];
  // fill a new array with hex contributions
  _contributions.forEach((cObj, i) => {
    const c = generalise(cObj.amount);
    contributions.push({
      id: _contributions[i].id,
      amount: c.hex(32)
    });
    // square root and shift the decimal point to create votes
    votes.push({
      id: _contributions[i].id,
      amount: generalise(Math.floor(Math.sqrt(c.integer) * accuracy)).hex(32)
    });
  });
  // submit votes
  const { encryptedVotes, encryptedContributions } = vote(votes, contributions);
  // fill array of user info for database
  const user = [];
  encryptedVotes.forEach((vote) => {
    const encContribution = encryptedContributions.find((obj) => obj.id === vote.id).amount;
    const contribution = _contributions.find((obj) => obj.id === vote.id).amount;
    const plainVote = votes.find((obj) => obj.id === vote.id).amount;
    user.push({
      id: vote.id,
      amount: generalise(contribution).number,
      encryptedAmount: {
        R: generalise(encContribution.R).all.hex(32),
        S: generalise(encContribution.S).all.hex(32)
      },
      vote: generalise(plainVote).integer,
      encryptedVote: {
        R: generalise(vote.amount.R).all.hex(32),
        S: generalise(vote.amount.S).all.hex(32)
      }
    });
  });
  return user;
}
/**
The vote function
@dev Calculates the encrypted votes and contributions of a user
Encrypted values are of the form (R, S) where R and S are elliptic curve points (with x, y coordinates)
We can input votes only and calculate contributions = vote**2
@param {Array(Object)} votes - array of hex strings (votes) to encrypt indexed by projectId
@param {Array(Object)} exactContributions - (optional) array of hex or integer strings index by projectId (contributions) to encrypt
*/
function vote(votes, exactContributions = []) {
  const encryptedVotes = [];
  const encryptedContributions = [];
  // we also need to encrypt the contribution (vote^2)
  let contributions = [];
  if (exactContributions[0]) {
    contributions = exactContributions;
  } else {
    // otherwise, we store them as vote^2
    votes.forEach((vote) => {
      contributions.push({
        id: vote.id,
        amount: generalise(vote ** 2).hex(32)
      });
    });
  }
  // encrypt the votes
  votes.forEach((vote) => {
    encryptedVotes.push({
      id: vote.id,
      amount: enc([BigInt(randomHex(31))], [vote.amount])[0]
    });
  });
  // repeat for contributions
  contributions.forEach((contribution) => {
    encryptedContributions.push({
      id: contribution.id,
      amount: enc([BigInt(randomHex(31))], [contribution.amount])[0]
    });
  });

  return { encryptedVotes, encryptedContributions };
}

/**
Checks the final tally
@dev This function takes all user vote data from the db and decrypts the final tally
Since we are doing this off-chain, we also store the plaintext, and instead check that the encrypted values are correct (this saves some time brute forcing values)
The steps are:
- Sum all encrypted votes and contributions
- Sum all plaintext votes and contributions
- Check that decrypt(sum of encrypted votes) = sum of plaintext votes
- Check above for contributions
- Calculate the expected matched amount using quadratic funding formula
- Return this matched amount, plaintext votes and contributions, and encrypted votes and contributions (compressed and uncompressed)
@param {Array} projectValues
Expected:
[{
  votes: [
    id: String,
    amount: {
      type: Number
    },
    encryptedAmount: {
      R: [],
      S: []
    },
    vote: {
      type: String
    },
    encryptedVote: {
      R: [],
      S: []
    }
  ]
}]
*/
function checkTally(projectValues) {
  const matchingFund = 150000;
  // first sum the points and values
  const tally = [];
  // const funding = [];
  let quadraticFundingBase = 0;
  projectValues.forEach((voteSet) => {
    // add all votes, encrypted and plaintext
    voteSet.votes.forEach((obj) => {
      let thisProject;
      if (!tally.find((o) => o.id === obj.id)) {
        thisProject = {
          id: obj.id,
          expectedTally: 0,
          encryptedTally: { R: BABYJUBJUB.INFINITY, S: BABYJUBJUB.INFINITY },
          expectedFunding: 0,
          encryptedFunding: { R: BABYJUBJUB.INFINITY, S: BABYJUBJUB.INFINITY }
        };
        tally.push(thisProject);
      } else {
        thisProject = tally.find((o) => o.id === obj.id);
      }
      thisProject.expectedTally += generalise(obj.vote).number;
      thisProject.expectedFunding += obj.amount;
      thisProject.encryptedTally.R = add(
        thisProject.encryptedTally.R,
        generalise(obj.encryptedVote.R).all.bigInt
      );
      thisProject.encryptedTally.S = add(
        thisProject.encryptedTally.S,
        generalise(obj.encryptedVote.S).all.bigInt
      );
      thisProject.encryptedFunding.R = add(
        thisProject.encryptedFunding.R,
        generalise(obj.encryptedAmount.R).all.bigInt
      );
      thisProject.encryptedFunding.S = add(
        thisProject.encryptedFunding.S,
        generalise(obj.encryptedAmount.S).all.bigInt
      );
    });
  });

  tally.forEach((thisProject) => {
    // for each project, decrypt the tally and funding amounts
    const decryptedTallyPoint = dec([thisProject.encryptedTally])[0];
    let expectedPoint = scalarMult(thisProject.expectedTally, GENERATOR);
    if (expectedPoint[0] === decryptedTallyPoint[0]) {
      thisProject.voteTally = thisProject.expectedTally;
    } else {
      throw new Error(
        `Expected Tally ${thisProject.expectedTally} for project ${thisProject.id} differs from decrypted value`
      );
    }
    const decryptedFundingPoint = dec([thisProject.encryptedFunding])[0];
    expectedPoint = scalarMult(thisProject.expectedFunding, GENERATOR);
    if (expectedPoint[0] === decryptedFundingPoint[0]) {
      thisProject.userFunding = thisProject.expectedFunding;
    } else {
      throw new Error(
        `Expected Funding ${thisProject.expectedFunding} for project ${thisProject.id} differs from decrypted value`
      );
    }
    delete thisProject.expectedTally;
    delete thisProject.expectedFunding;
    quadraticFundingBase += thisProject.voteTally ** 2;
  });
  // Now we have tally = an array of:
  /*
  {
    id: String,
    voteTally: Number,
    encryptedTally: { R:, S: },
    userFunding: Number,
    encryptedFunding: { R:, S: }
  };
  Quadratic funding does:
  Matched amount = matchingPool * ( (project.tally)**2 / (sum of project.tallies**2) )
  */
  tally.forEach((project) => {
    // calculated matched amount
    project.matchedAmount = matchingFund * (project.voteTally ** 2 / quadraticFundingBase);
    project.uncompressedEncryptedTally = project.encryptedTally;
    project.uncompressedEncryptedFunding = project.encryptedFunding;
    // store compressed encrypted values
    project.encryptedTally = [
      edwardsCompress(project.encryptedTally.R),
      edwardsCompress(project.encryptedTally.S)
    ];
    project.encryptedFunding = [
      edwardsCompress(project.encryptedFunding.R),
      edwardsCompress(project.encryptedFunding.S)
    ];
  });

  return tally;
}

/**
Performs El-Gamal encryption
@param {Array(String)} strings - array containing the hex strings to be encrypted
@param {String} randomSecret - random value mod Fq.  Must be changed each time
this function is called
*/
function enc(_randomSecrets, votes) {
  // TODO revert back to single msg encryption rather than arrays
  // we want to calculate V + kY = vG + k(public key)
  // eslint-disable-next-line valid-typeof
  if (typeof _randomSecrets[0] !== 'bigint')
    throw new Error(
      'The random secret chosen for encryption should be a BigInt, unlike the messages, which are hex strings'
    );

  if (_randomSecrets.length !== votes.length) throw new Error('We need a secret for each vote');
  if (!AUTHORITY_PUBLIC_KEY[0]) throw new Error('Authority public key not set');
  const randomSecrets = lowOrderCheck(_randomSecrets, votes);
  // so we convert a string to a curve point by a scalar multiplication
  // V
  const votePoints = votes.map((e) => scalarMult(ensure0x(e), GENERATOR));
  // now we use the public keys and random number to generate shared secrets
  // kY
  const sharedSecrets = randomSecrets.map((randomSecret) =>
    scalarMult(randomSecret, AUTHORITY_PUBLIC_KEY)
  );
  // finally, we can encrypt the messages using the share secrets
  const R = randomSecrets.map((randomSecret) => scalarMult(randomSecret, GENERATOR));
  // V + kY
  const encryptedMessages = votePoints.map((v, i) => add(v, sharedSecrets[i]));
  const encryption = encryptedMessages.map((msg, i) =>
    Object.fromEntries([
      ['R', R[i]],
      ['S', msg]
    ])
  );
  return encryption;
}

/**
Checks that the point is not in the low order subgroup (cofactor = 8)
@param {Array(String)} strings - array containing the hex strings to be encrypted
@param {String} randomSecret - random value mod Fq
*/
function lowOrderCheck(randomSecrets, votes) {
  const revisedSecrets = randomSecrets;
  randomSecrets.forEach((randomSecret, i) => {
    const possibleR = scalarMult(randomSecret, GENERATOR);
    const possibleS = add(
      scalarMult(ensure0x(votes[i]), GENERATOR),
      scalarMult(randomSecret, AUTHORITY_PUBLIC_KEY)
    );
    if (
      scalarMult(8, possibleR) === BABYJUBJUB.INFINITY ||
      scalarMult(8, possibleS) === BABYJUBJUB.INFINITY
    ) {
      // calls itself recursively until a suitable secret is found
      revisedSecrets[i] = lowOrderCheck([BigInt(randomHex(31))], [votes[i]]);
    }
  });
  return revisedSecrets;
}

/**
Performs El-Gamal dencryption
@param {Object(String)} encryption - object of (R,S) pairs to decrypt
*/
function dec(encryption) {
  // TODO revert back to single msg encryption rather than arrays
  // initialise message array for points M
  const messages = [];
  // perform S - xR = M
  encryption.forEach((pair) => {
    const { R, S } = pair;
    messages.push(add(S, negate(scalarMult(AUTHORITY_PRIVATE_KEY, R))));
  });
  return messages;
}

/**
A function to set the public key of the authority
@dev when used inside a container, this file will grab the environment variable key and this fn is not required
otherwise, we set it here
*/
function setAuthorityPublicKeys(key = 0) {
  if (key === 0 && AUTHORITY_PRIVATE_KEY === 0) {
    AUTHORITY_PRIVATE_KEY = randomHex(31);
  } else if (AUTHORITY_PRIVATE_KEY === 0) {
    AUTHORITY_PRIVATE_KEY = key;
  }
  AUTHORITY_PUBLIC_KEY = scalarMult(AUTHORITY_PRIVATE_KEY, GENERATOR);
  return AUTHORITY_PUBLIC_KEY;
}

/**
The decryption gives curve points, which were originally mapped to a value.
Unfortunately, reversing that mapping requires brute forcing discrete logarithm.
Forturnately, there aren't many values that we need to check so it's not too onerous
@param {array} m - ordered pair mod q representing the decrypted curve point
@param {generator} gen - generator (implements generator interface) for brute force guesses
*/
// eslint-disable-next-line no-unused-vars
function bruteForce(m, gen) {
  for (const guess of gen) {
    const p = scalarMult(guess, GENERATOR);
    if (p[0] === m[0] && p[1] === m[1]) {
      // console.log(guess);
      return guess;
    }
  }
  return 'no decrypt found';
}
// eslint-disable-next-line no-unused-vars
function* rangeGenerator(max, min = 0) {
  for (let i = min; i < max; i++) yield i;
}

/**
  BabyJubJub elliptic curve functions:
*/

function isOnCurve(p) {
  const { JUBJUBA: a, JUBJUBD: d } = BABYJUBJUB;
  const uu = (p[0] * p[0]) % Fp;
  const vv = (p[1] * p[1]) % Fp;
  const uuvv = (uu * vv) % Fp;
  return (a * uu + vv) % Fp === (one + d * uuvv) % Fp;
}

function negate(g) {
  return [Fp - g[0], g[1]];
}

/**
Point addition on the babyjubjub twisted edwards curve
*/
function add(p, q) {
  const { JUBJUBA: a, JUBJUBD: d } = BABYJUBJUB;
  const u1 = p[0];
  const v1 = p[1];
  const u2 = q[0];
  const v2 = q[1];
  const uOut = modDivide(u1 * v2 + v1 * u2, one + d * u1 * u2 * v1 * v2, Fp);
  const vOut = modDivide(v1 * v2 - a * u1 * u2, one - d * u1 * u2 * v1 * v2, Fp);
  if (!isOnCurve([uOut, vOut])) throw new Error('Addition point is not on the babyjubjub curve');
  return [uOut, vOut];
}

/**
Scalar multiplication on a babyjubjub curve
@param {String} scalar - scalar mod q (will wrap if greater than mod q, which is probably ok)
@param {Object} h - curve point in u,v coordinates
*/
function scalarMult(scalar, h) {
  const { INFINITY } = BABYJUBJUB;
  const a = ((BigInt(scalar) % Fq) + Fq) % Fq; // just in case we get a value that's too big or negative
  const exponent = a.toString(2).split(''); // extract individual binary elements
  let doubledP = [...h]; // shallow copy h to prevent h being mutated by the algorithm
  let accumulatedP = INFINITY;
  for (let i = exponent.length - 1; i >= 0; i--) {
    const candidateP = add(accumulatedP, doubledP);
    accumulatedP = exponent[i] === '1' ? candidateP : accumulatedP;
    doubledP = add(doubledP, doubledP);
  }
  if (!isOnCurve(accumulatedP))
    throw new Error('Scalar multiplication point is not on the babyjubjub curve');
  return accumulatedP;
}

/** A useful function that takes a curve point and throws away the x coordinate
retaining only the y coordinate and the odd/eveness of the x coordinate (plays the
part of a sign in mod arithmetic with a prime field).
@dev We use this to compress encrypted values for the circuit hash
*/
function edwardsCompress(p) {
  const px = p[0];
  const py = p[1];
  const xBits = px.toString(2).padStart(256, '0');
  const yBits = py.toString(2).padStart(256, '0');
  const sign = xBits[255] === '1' ? '1' : '0';
  const yBitsC = sign.concat(yBits.slice(1)); // add in the sign bit
  const y = ensure0x(BigInt('0b'.concat(yBitsC)).toString(16).padStart(64, '0')); // put yBits into hex
  return y;
}

function edwardsDecompress(y) {
  const py = BigInt(y).toString(2).padStart(256, '0');
  const sign = py[0];
  const yfield = BigInt(`0b${py.slice(1)}`); // remove the sign encoding
  if (yfield > JUBJUBP || yfield < 0)
    throw new Error(`y cordinate ${yfield} is not a field element`);
  // 168700.x^2 + y^2 = 1 + 168696.x^2.y^2
  const y2 = mulMod([yfield, yfield]);
  const x2 = modDivide(
    addMod([y2, BigInt(-1)]),
    addMod([mulMod([JUBJUBD, y2]), -JUBJUBA]),
    JUBJUBP
  );
  if (x2 === 0n && sign === '0') return BABYJUBJUB.INFINITY;
  let xfield = squareRootModPrime(x2);
  const px = BigInt(xfield).toString(2).padStart(256, '0');
  if (px[255] !== sign) xfield = JUBJUBP - xfield;
  const p = [xfield, yfield];
  if (!isOnCurve(p)) throw new Error('The computed point was not on the Babyjubjub curve');
  return p;
}

/**
  Modular arithmetic functions for BabyJubJub:
*/

// This module mostly takes some useful functions from:
// https://github.com/rsandor/number-theory
// but converts them for BigInt (the original library is limited to <2**52)
// We are very grateful for the original work by rsandor

function addMod(addMe, m = JUBJUBP) {
  return addMe.reduce((e, acc) => (((e + m) % m) + acc) % m, BigInt(0));
}

function mulMod(timesMe, m = JUBJUBP) {
  return timesMe.reduce((e, acc) => (((e + m) % m) * acc) % m, BigInt(1));
}

function powerMod(base, exponent, m = JUBJUBP) {
  if (m === BigInt(1)) return BigInt(0);
  let result = BigInt(1);
  let b = (base + m) % m; // add m in case it's negative: % gives the remainder, not the mod
  let e = exponent;
  while (e > BigInt(0)) {
    if (e % BigInt(2) === BigInt(1)) result = (result * b) % m;
    e >>= BigInt(1); // eslint-disable-line no-bitwise
    b = (b * b) % m;
  }
  return result;
}

// modular division

// function for extended Euclidean Algorithm
// (used to find modular inverse.
function gcdExtended(a, b, _xy) {
  const xy = _xy;
  if (a === zero) {
    xy[0] = zero;
    xy[1] = one;
    return b;
  }
  const xy1 = [zero, zero];
  const gcd = gcdExtended(b % a, a, xy1);

  // Update x and y using results of recursive call
  xy[0] = xy1[1] - (b / a) * xy1[0];
  xy[1] = xy1[0]; // eslint-disable-line prefer-destructuring

  return gcd;
}

// Function to find modulo inverse of b.
function modInverse(b, m) {
  const xy = [zero, zero]; // used in extended GCD algorithm
  const g = gcdExtended(b, m, xy);
  if (g !== one) throw new Error('Numbers were not relatively prime');
  // m is added to handle negative x
  return ((xy[0] % m) + m) % m;
}

// Function to compute a/b mod m
function modDivide(a, b, m) {
  const aa = ((a % m) + m) % m; // check the numbers are mod m and not negative
  const bb = ((b % m) + m) % m; // do we really need this?
  const inv = modInverse(bb, m);
  return (inv * aa) % m;
}

/**
  @dev The following functions are needed to find a squareRootModPrime
  This is a complex operation but we require it for compressing and decompressing elliptic curve points
  There are many explainers, but this is a good one:
  https://www.rieselprime.de/ziki/Modular_square_root
*/

/**
  @dev Like the Legendre symbol, the Jacobi symbol tells us whether an element has a square root mod p
  If this function returns 1, a has a sqrt mod b (is a quadratic residue)
  If it returns -1, a does not have a sqrt mod b (is a quadraticNonresidue)
*/
function jacobiSymbol(_a, _b) {
  if (typeof _a !== 'bigint') throw new Error(`first parameter ${_a} is not a Bigint`);
  if (typeof _b !== 'bigint') throw new Error(`second parameter ${_b} is not a Bigint`);
  let a = _a;
  let b = _b;
  if (b % BigInt(2) === BigInt(0)) return NaN;
  if (b < BigInt(0)) return NaN;

  // (a on b) is independent of equivalence class of a mod b
  if (a < BigInt(0)) a = (a % b) + b;

  // flips just tracks parity, so I xor terms with it and end up looking at the
  // low order bit
  let flips = 0;
  // TODO Refactor while loop
  // eslint-disable-next-line no-constant-condition
  while (true) {
    a %= b;
    // (0 on b) = 0
    if (a === BigInt(0)) return 0;
    // Calculation of (2 on b)
    while (a % BigInt(2) === BigInt(0)) {
      // b could be so large that b*b overflows
      flips ^= Number(((b % BigInt(8)) * (b % BigInt(8)) - BigInt(1)) / BigInt(8)); // eslint-disable-line no-bitwise
      a /= BigInt(2);
    }

    // (1 on b) = 1
    if (a === BigInt(1)) {
      // look at the low order bit of flips to extract parity of total flips
      return flips & 1 ? -1 : 1; // eslint-disable-line no-bitwise
    }

    // Now a and b are coprime and odd, so "QR" applies
    // By reducing modulo 4, I avoid the possibility that (a-1)*(b-1) overflows
    flips ^= Number((((a % BigInt(4)) - BigInt(1)) * ((b % BigInt(4)) - BigInt(1))) / BigInt(4)); // eslint-disable-line no-bitwise

    const temp = a;
    a = b;
    b = temp;
  }
}

/**
  @dev We loop (safely) to find some quadratic non residue mod p
*/
function quadraticNonresidue(p) {
  const SAFELOOP = 100000;
  const q = SAFELOOP < p ? SAFELOOP : p;
  for (let x = BigInt(2); x < q; x++) {
    if (jacobiSymbol(x, p) === -1) return x;
  }
  return NaN;
}

/**
  @dev Calculates the square root of n mod p using the Tonelli-Shanks algorithm
  https://en.wikipedia.org/wiki/Tonelli-Shanks_algorithm
  Uses all the functions above
*/
function squareRootModPrime(n, p = JUBJUBP) {
  if (jacobiSymbol(n, p) !== 1) return NaN;

  let Q = p - BigInt(1);
  let S = BigInt(0);
  while (Q % BigInt(2) === BigInt(0)) {
    Q /= BigInt(2);
    S++;
  }

  // Now p - 1 = Q 2^S and Q is odd.
  if (p % BigInt(4) === BigInt(3)) {
    return powerMod(n, (p + BigInt(1)) / BigInt(4), p);
  }
  // So S != 1 (since in that case, p equiv 3 mod 4
  const z = quadraticNonresidue(p);
  let c = powerMod(z, Q, p);
  let R = powerMod(n, (Q + BigInt(1)) / BigInt(2), p);
  let t = powerMod(n, Q, p);
  let M = S;
  // TODO Refactor while loop
  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (t % p === BigInt(1)) return R;

    // Find the smallest i (0 < i < M) such that t^{2^i} = 1
    let u = t;
    let i;
    for (i = BigInt(1); i < M; i++) {
      u = (u * u) % p;
      if (u === BigInt(1)) break;
    }

    const minimumI = i;
    i++;

    // Set b = c^{2^{M-i-1}}
    let b = c;
    while (i < M) {
      b = (b * b) % p;
      i++;
    }

    M = minimumI;
    R = (R * b) % p;
    t = (t * b * b) % p;
    c = (b * b) % p;
  }
}

module.exports = {
  contributeThenVote,
  vote,
  checkTally,
  setAuthorityPublicKeys,
  edwardsCompress,
  edwardsDecompress
};
