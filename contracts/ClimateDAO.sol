// SPDX-License-Identifier: UNLICENSED

pragma solidity 0.8.7;

import './Ownable.sol';
import './IUSDC.sol';
import './Verifier.sol';
contract ClimateDAO is Ownable {

  struct Project {
    uint8 id;
    address wallet;
  }

  struct ProjectDistribution {
    uint8 id;
    uint64 tally; // sum of sqrts of contributions
    uint64 funding; // sum of user contributions
  }

  struct Signature {
    uint8 v;
    bytes32 r;
    bytes32 s;
  }

  bool public cancelled;
  bool public distributed;
  uint public startTime;
  uint public endTime;
  uint public fundingPool;
  uint public matchingPool; // 150k for all projects
  uint public baseline; // 20k per project
  uint8[] projectIds;
  uint[] public verifyingKey;
  mapping(uint8 => address) public projects;
  mapping(address => uint) public contributors;
  IUSDC public usdcToken;

  event Contribute(address indexed _from, uint value);
  event Withdraw(address indexed _contributer, uint amount);
  event Distribute(address wallet, uint id, uint funded, uint matched, uint total);

  /**
   * @notice constructor
   * @param _projects - project info
   * @param _verifyingKey - vk for zkp
   * @param _startTime - time of voting start
   * @param USDCAddress - address of USDC contract
   * @param _matchingPool - amount of USDC in matching pool (decimals = 6)
   * @param _baseline - amount of USDC in baseline (decimals = 6)
   */
  constructor(
    Project[] memory _projects,
    uint[] memory _verifyingKey,
    uint _startTime,
    address USDCAddress,
    uint _matchingPool,
    uint _baseline
  ) {
    startTime = _startTime + 30 minutes;
    endTime = _startTime +  1 days;
    // we initialise the projects structs with IDs and wallets
    for (uint i = 0; i < 5; i++) {
      projects[_projects[i].id] = _projects[i].wallet;
      projectIds.push(_projects[i].id);
    }
    usdcToken = IUSDC(USDCAddress);
    verifyingKey = _verifyingKey;
    matchingPool = _matchingPool;
    baseline = _baseline;
  }

  /**
   * @notice Modifier for stopping actions when contract cancelled
   */
  modifier whenNotCancelled() {
    require(!cancelled, "cancelled");
    _;
  }

  /**
   * @notice Modifier for allowing actions when voting in progress
   */
  modifier whenVotingInProgress() {
    require(startTime <= block.timestamp, "voting not started");
    require(endTime >= block.timestamp, "voting has ended");
    _;
  }

  /**
   * @notice Modifier for stopping actions when voting in progress
   */
  modifier whenVotingComplete() {
    require(endTime <= block.timestamp, "voting still open");
    _;
  }

  /**
   * @notice Modifier for stopping actions after fund distribution complete
   */
  modifier beforeDistribution() {
    require(!distributed, "distribution already happened");
    _;
  }

  /**
   * @notice Update address of project
   * @param id Project id
   * @param newAddress Project address
   */
  function updateProject(uint8 id, address newAddress) external onlyOwner {
    require(newAddress != address(0), 'Zero address');
    projects[id] = newAddress;
  }

  /**
   * @notice Update address of USDC token contract
   * @param newAddress USDC address
   */
  function updateUSDC(address newAddress) external onlyOwner {
    usdcToken = IUSDC(newAddress);
  }

  /**
   * @notice Update end time
   * @param newEndTime end time
   */
  function updateEndDate(uint newEndTime) external onlyOwner {
    require(newEndTime >= block.timestamp, "new end time in the past!");
    endTime = newEndTime;
  }

  /**
   * @notice Update start time
   * @param newStartTime start time
   */
  function updateStartDate(uint newStartTime) external onlyOwner {
    require(startTime > block.timestamp, "voting already started!");
    require(newStartTime > block.timestamp, "new start time in the past!");
    startTime = newStartTime;
  }

  /**
   * @notice Update vk for project circuit
   * @param _verifyingKey - vk
   */
  function registerVerificationKey(uint[] memory _verifyingKey) external onlyOwner {
    verifyingKey = _verifyingKey;
  }

  /**
   * @notice Get contribution of an user
   * @param user Contributor address
   */
  function getContributionOf(address user) external view returns (uint) {
    return contributors[user];
  }

  /**
   * @notice Get all contributions by users
   */
  function getTotalContributions() external view returns (uint) {
    return fundingPool;
  }

  /**
   * @notice Get USDC balance of addr
   */
  function getUSDCBalance(address ad) external view returns (uint) {
    return usdcToken.balanceOf(ad);
  }


  /**
   * @notice Recover signer's address from a signed message and mark nonce as used
   * @param sigV      v of the signature
   * @param sigR      r of the signature
   * @param sigS      s of the signature
   * @param digest    Keccak-256 hash digest of the signed message
   * @return Signer address
   */
  function getSigner(uint8 sigV, bytes32 sigR, bytes32 sigS, bytes32 digest) internal pure returns (address) {
    address signer = ecrecover(digest, sigV, sigR, sigS);
    return signer;
  }

  /**
   * @notice Verify our proof of decryption of tally
   * @dev Ideally the encrypted information would be on-chain, due to gas costs it is off-chain and passed as calldata. ALL inputs in the hash are linked with the proof - if any one piece is wrong, the proof will fail
   * @param proof - proof of correct decryption of tally
   * @param voteTallyEnc - encrypted tally of votes (sqrt(contribution))
   * @param voteTally - plaintext tally of votes
   * @param fundingTallyEnc - encrypted funding from users
   * @param fundingTally - plaintext funding from users
   * @param encPublicKey - auth public key for encryption
   */
  function verifyProof(
    uint256[] calldata proof,
    bytes32[10] calldata voteTallyEnc,
    bytes8[5] memory voteTally,
    bytes32[10] calldata fundingTallyEnc,
    bytes8[5] memory fundingTally,
    bytes32 encPublicKey
  ) internal {
    // calculate innerHash = hash of encrypted values
    bytes32 innerHash = sha256(abi.encodePacked(voteTallyEnc, fundingTallyEnc));
    // calculate publicInputHash
    // we must encode each bytes8 separately to ensure it matches hash in circuit
    bytes32 testHash = sha256(abi.encodePacked(innerHash, encPublicKey, voteTally[0], voteTally[1], voteTally[2], voteTally[3], voteTally[4], fundingTally[0], fundingTally[1], fundingTally[2], fundingTally[3], fundingTally[4]));
    // verify proof with gm17 verifier
    // concat hash by selecting the 1st 253 of 256 bits
    require(Verifier.verify(proof, uint256(testHash & 0x1fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff), verifyingKey), 'This proof and/or inputs appears to be invalid');
  }

  /**
   * @notice Transfer funds
   * @dev This is only executed if the proof of tally has been verified, and can only be called internally
   * @param projectsToFund - amount of funding and votes per project
   */
  function distributeFunds(ProjectDistribution[] calldata projectsToFund) private {
    // quadratic funding algorithm:
    // each project recieves matchingPool * ((sum of sqrt(contributions)**2 for project)/sum of sqrt(contributions)**2 for all projects))
    // our vote tally = sum of sqrt(contribution)
    uint256 totalQuadratic;
    // find the total of all votes **2 (the denominator)
    for (uint i = 0; i < 5; i++) {
      totalQuadratic += uint(projectsToFund[i].tally)**2;
    }
    // find and transfer the matched funds
    for (uint i = 0; i < 5; i++) {

      uint256 matched = (matchingPool * (uint(projectsToFund[i].tally)**2))/totalQuadratic;
      uint256 totalToTransfer = uint(projectsToFund[i].funding) + matched + baseline;

      // moving event before external call to avoid re-entrancy bugs
      emit Distribute(projects[projectsToFund[i].id], projectsToFund[i].id, projectsToFund[i].funding, matched, totalToTransfer);

      fundingPool -= projectsToFund[i].funding;
      usdcToken.transfer(projects[projectsToFund[i].id], totalToTransfer);

    }
    distributed = true;
    // we need to check that we haven't missed out any funds from users
    require(fundingPool < 1, 'Some user contributions havent been transferred!');
  }


  /**
   * @notice Execute quadratic funding
   * @dev This is called by the owner to begin the process of distributing funds to projects. We distribute user funding and calculated matched funds.
   * @param proof - proof of correct decryption of tally
   * @param projectsToFund - amount of funding and votes per project
   * @param voteTallyEnc - encrypted tally of votes
   * @param fundingTallyEnc - encrypted funding from users
   * @param encPublicKey - auth public key for encryption
   */
  function verifyThenDistribute(
    uint256[] calldata proof,
    ProjectDistribution[] calldata projectsToFund,
    bytes32[10] calldata voteTallyEnc,
    bytes32[10] calldata fundingTallyEnc,
    bytes32 encPublicKey
  ) external onlyOwner whenVotingComplete beforeDistribution {
    bytes8[5] memory tallyBytes; // we convert to hash in verifyProof, so this must be converted to bytes
    bytes8[5] memory fundingBytes;
    for (uint i = 0; i < 5; i++) {
      // NB projects must be ordered the same as when input to the circuit
      tallyBytes[i] = bytes8(projectsToFund[i].tally);
      fundingBytes[i] = bytes8(projectsToFund[i].funding);
    }
    // we verify that the encrypted tally & funds decrypt to these values
    verifyProof(proof, voteTallyEnc, tallyBytes, fundingTallyEnc, fundingBytes, encPublicKey);
    // we initiate transfer
    distributeFunds(projectsToFund);

  }

  /**
   * @notice Internal function to execute usdc transfer with a signed transaction.
   * https://github.com/centrehq/centre-tokens/blob/0d3cab14ebd133a83fc834dbd48d0468bdf0b391/contracts/v2/FiatTokenV2.sol#L137
   * @param from          Payer's address (Authorizer)
   * @param to            Payee's address
   * @param value         Amount to be transferred
   * @param validAfter    The time after which this is valid (unix time)
   * @param validBefore   The time before which this is valid (unix time)
   * @param nonce         Unique nonce
   * @param v             v of the signature
   * @param r             r of the signature
   * @param s             s of the signature
   * @param user          Owner address
   */
  function contribute(
    address from,
    address to,
    uint256 value,
    uint256 validAfter,
    uint256 validBefore,
    bytes32 nonce,
    uint8 v,
    bytes32 r,
    bytes32 s,
    address user
  ) internal onlyOwnerSigned(user) {
    require(contributors[from] == 0, 'User has already voted!');
    emit Contribute(from, value);
    contributors[from] = value;
    fundingPool += value;
    usdcToken.receiveWithAuthorization(from, to, value, validAfter, validBefore, nonce, v, r, s);
  }

  /**
   * @notice Execute usdc transfer with a signed transaction.
   * @dev The usdc transfer is performed here to keep track of contributions.
   * Contributers will be able to withdraw their contribution if voting has been cancelled.
   * Since kyc is performed offchain, this method can be called only with owner's authorization. Transactions are relayed
   * using a relayer, so msg.sender cannot be used to verify ownership. Hence we use owners singature to prove owner has
   * authorized to perform this transaction.
   * The below 7 params are arguments for USDC's receiveWithAuthorization.
   * https://github.com/centrehq/centre-tokens/blob/0d3cab14ebd133a83fc834dbd48d0468bdf0b391/contracts/v2/FiatTokenV2.sol#L137
   * @param from          Payer's address (Authorizer)
   * @param to            Payee's address
   * @param value         Amount to be transferred
   * @param validAfter    The time after which this is valid (unix time)
   * @param validBefore   The time before which this is valid (unix time)
   * @param nonce         Unique nonce
   * @param RWASig        ReceiveWithAuthorization digital signature [ v, r, s]
   * @param ownerSig      Owner's Sigature. Used to verify owner's authorization to perform this transaction.
   */
  function contributeSigned(
    address from,
    address to,
    uint256 value,
    uint256 validAfter,
    uint256 validBefore,
    bytes32 nonce,
    Signature memory RWASig,
    Signature memory ownerSig
  ) external whenNotCancelled whenVotingInProgress {
    require(value > 0 && value <= 9999*1000000, 'Donations may not be over USDC 9,999 per user');
    require(fundingPool + value <= 750000*1000000, 'We have reached the limit of user contributions!');
    bytes32 hash = keccak256(abi.encodePacked(this, from, value,  nonce));
    bytes32 messageDigest = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
    address signer = getSigner(ownerSig.v, ownerSig.r, ownerSig.s, messageDigest);
    require(signer != address(0), 'signer cannot be zero address');
    contribute(from, to, value, validAfter, validBefore, nonce, RWASig.v, RWASig.r, RWASig.s, signer);
  }

  /**
   * @notice Withdraw contribution if contract has been cancelled.
   * @dev Up on cancellation, contributors can withdraw their contributions
   * Contributors cannot call this function post distribution
   */
  function withdrawContribution() external beforeDistribution {
    require(cancelled, 'Not cancelled');
    uint amount = contributors[msg.sender];
    require(amount > 0, 'no balance');
    contributors[msg.sender] = 0;
    emit Withdraw(msg.sender, amount);
    usdcToken.transfer(msg.sender, amount);
  }

  /**
   * @notice Cancel contract
   * @dev This is called by owner to cancel contract if we do NOT need to transfer matchingPool + baseline funds to projects
   * That is if we have yet to transfer matching pool + baseline  to this contract. Matching pool + baseline = 250000*1000000
   * Owner should not be able to cancel post distribution
   */
  function cancel() external onlyOwner whenNotCancelled beforeDistribution {
    uint balance = usdcToken.balanceOf(address(this));
    require( balance < 250000*1000000 + fundingPool, 'contract have matching pool');
    cancelled = true;
  }

  /**
   * @notice Cancel contract and distribute matchingPool + baseline
   * @dev This is called by owner to cancel contract if matchingPool + baseline is yet to be transfered to projects
   * Upon calling cancelAndTransfer, each project will get their portion of funding from matchingPool + baseline.
   * Contributions from users will not be transfered to projects in case of cancellation.
   * Contributors will be able to withdraw their contributions if contract has been cancelled.
   */
  function cancelAndTransfer() external onlyOwner whenNotCancelled beforeDistribution {
    uint balance = usdcToken.balanceOf(address(this));
    require( balance >= 250000*1000000 + fundingPool, 'contract does not have matching pool');
    cancelled = true;
    uint projectContribution = (matchingPool)/5 + baseline;
    for (uint i = 0; i < 5; i++) {
      usdcToken.transfer(projects[projectIds[i]], projectContribution);
    }
  }

}
