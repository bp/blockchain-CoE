const CONSTANTS = {
  chainId: 3,
  validBefore: 1931525157,
  validAfter: Math.round(Date.now() / 1000),
  apiURL: 'http://localhost:8000/sapi',
  matchingContribution: 150000000000,
  baselineContribution: 20000000000
};

const projectName = 'Ethria';

module.exports = {
  CONSTANTS,
  projectName
};
