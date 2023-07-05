const ethers = require('ethers');
const fs = require('fs');
const axios = require('axios');
const randombytes = require('randombytes');
const yaml = require('js-yaml');
const docker = require('docker-compose');
const path = require('path');
const ClimateDAO = require('../artifacts/ClimateDAO.json');
const USDCStub = require('../artifacts/USDCStub.json');
const {
  signTransferAuthorization,
  userContribution,
  getSigningMessage,
  signMessage,
  getContractWithSigner,
  verifyContribution
} = require('./helper');
const { CONSTANTS } = require('./constants');

require('dotenv').config({ path: '../.env' });

const vkJson = JSON.parse(
  fs.readFileSync(`../proving-files/decrypt-tally-hash/decrypt-tally-hash_vk.key`, 'utf-8')
);
const vk = Object.values(vkJson).flat(Infinity);

const startTime = process.argv.find((elt) => elt.includes('climateTiming.js'))
  ? Math.floor(Date.now() / 1000) + 6000
  : Math.floor(Date.now() / 1000);

/**
 * This test file is for testing the ClimateDAO application with multiple user donations,
 * where the contracts will get deployed, new users will get created randomly, required number of test USDC will be
 * deposited to user wallets, User KYC will be done and the user will be contributing to random
 * Climate DAO projects. The progress will get reflected in UI. Once the voting period is over,
 * the admin functionalities can be performed from the UI itself.
 *
 * Note: The Contract compilation has to be done manually to get the artifacts.
 * The variable {numOfVoters} will decide the total number of users fo this test.
 * Some of the Constants below {envData} and {owner} details has to be provided in .env file in the root.
 */

var usdcContractAddress = '';
var climateDAOContractAddress = '';

const owner = {
  address: process.env.ADMIN_ADDRESS,
  key: process.env.ADMIN_PRIVATE_KEY
};

const envData = {
  jsonRpc: process.env.JSON_RPC
};

//set total number of contributors
const numOfVoters = 10;

/**
 * Deploys Contract
 *
 * @returns {ethers.Signer} - Signer instance.
 */
const deployContract = async (contractJson, wallet, provider, deployArgs) => {
  const factory = new ethers.ContractFactory(contractJson.abi, contractJson.bytecode, wallet);

  let contractInstance;
  if (deployArgs) {
    const { projects, vk, startTime, usdcContractAddress, matchingPool, baselineContribution } =
      deployArgs;

    contractInstance = await factory.deploy(
      projects,
      vk,
      startTime,
      usdcContractAddress,
      matchingPool,
      baselineContribution
    );
  } else {
    const transaction = factory.getDeployTransaction();

    const estimatedGasLimit = await provider.estimateGas(transaction);
    contractInstance = await factory.deploy({ gasLimit: estimatedGasLimit });
  }
  await contractInstance.deployTransaction.wait();
  const receipt = await contractInstance.deployed();
  return { receipt };
};

const deployContracts = async () => {
  console.log(`***** contract deployment started *****`);
  const provider = new ethers.providers.JsonRpcProvider(envData.jsonRpc);
  const wallet = new ethers.Wallet(owner.key, provider);

  //deploy USDC contract
  const usdcContract = await deployContract(USDCStub, wallet, provider);
  usdcContractAddress = usdcContract.receipt.address;
  const matchingPool = CONSTANTS.matchingContribution;
  const baselineContribution = CONSTANTS.baselineContribution;

  const projects = [
    [1, '0xe94D592C6D972F574255aE4B58E4FbB5268155E6'],
    [2, '0x48A15FF342Cc95D8258d95358AFfCF689464EB3A'],
    [3, '0x24079020D2EB124dB1f79247bD9Cb0A72cdcba1F'],
    [4, '0x98C5998414def392bC11cb42Ce1F4A47BC119215'],
    [5, '0x510D2DC44d523a42Eb4520adC3F0935fd96bE2AC']
  ];
  const inputArgs = {
    projects,
    vk,
    startTime,
    usdcContractAddress,
    matchingPool,
    baselineContribution
  };

  //deploy ClimateDAO contract
  const climateDAOContract = await deployContract(ClimateDAO, wallet, provider, inputArgs);
  climateDAOContractAddress = climateDAOContract.receipt.address;
  console.log(`USDC Contract Address: ${usdcContractAddress}`);
  console.log(`ClimateDAO Contract Address: ${climateDAOContractAddress}`);

  //replace the data in docker file and restart the containers
  try {
    const dockerData = yaml.load(fs.readFileSync('../docker-compose.override.yml', 'utf8'));
    dockerData.services.ui.environment.USDC_CONTRACT = usdcContractAddress;
    dockerData.services.api.environment.USDC_CONTRACT = usdcContractAddress;
    dockerData.services.ui.environment.CLIMATE_DAO_CONTRACT = climateDAOContractAddress;
    dockerData.services.api.environment.CLIMATE_DAO_CONTRACT = climateDAOContractAddress;
    dockerData.services['event-listener'].environment.CLIMATE_DAO_CONTRACT =
      climateDAOContractAddress;
    dockerData.services.api.environment.NODE_ENV = 'test';
    dockerData.services.ui.environment.NODE_ENV = 'test';

    const yamlStr = yaml.dump(dockerData);
    fs.writeFileSync('../docker-compose.override.yml', yamlStr);
    docker.upAll({ cwd: path.join(__dirname), log: true }).then(
      () => {
        console.log(`done`);
      },
      (err) => {
        console.log(`error: ${err.message}`);
      }
    );
  } catch (error) {
    console.log(`error writing data: ${error}`);
    throw new Error(error);
  }

  //transfer bp matching pool contribution to ClimateDAO contract
  await mintUSDCToken(usdcContractAddress, climateDAOContractAddress, 250000000000); //250k USDC
  await contributeToProjects();
};

/**
 * Mint new token to the provided address.
 *
 * @param {address} contractAddress - USDC Contract Address
 * @param {address} toAddress - Address to which USDC has to be transferred
 */
const mintUSDCToken = async (contractAddress, toAddress, value) => {
  const contractInstance = getContractWithSigner(
    contractAddress,
    owner.key,
    USDCStub.abi,
    envData.jsonRpc
  );
  const transaction = await contractInstance.magicMint(toAddress, value);

  await transaction.wait();
  const balance = await contractInstance.balanceOf(toAddress);
  console.log(`Balance of Address-${toAddress} : ${balance}`);
};

/**
 * User Contribution flow, right from creating a new wallet to contribution
 */
const contributeToProjects = async () => {
  for (var i = 1; i <= numOfVoters; i++) {
    console.log(`count ${i}`);

    //create new wallet for user
    console.log(`Creating wallet for User ${i}`);
    const wallet = new ethers.Wallet.createRandom();
    const signingKey = wallet._signingKey();

    const user = {
      key: signingKey.privateKey,
      address: wallet.address,
      id: ''
    };
    console.log(`Account address for User ${i} - ${user.address}`);
    let userToken;

    //transfer some USDC to the new user address before contributing
    await mintUSDCToken(usdcContractAddress, user.address, 10000000000); //10k USDC

    //create the user collection in db
    const res = await axios({
      method: 'POST',
      url: `${CONSTANTS.apiURL}/user`,
      data: {
        address: user.address
      },
      withCredentials: true
    });
    if (res?.data) {
      console.log(`User data created.`);
    }

    const resp = await axios({
      method: 'GET',
      url: `${CONSTANTS.apiURL}/user/address?address=${user.address}`,
      withCredentials: true
    });
    if (resp?.data) {
      const message = await getSigningMessage(resp.data.user.nonce, user.address);
      const userSignature = await signMessage(message, user.key);
      user.id = resp.data.user._id;
      console.log(`UserId: ${user.id}`);

      //complete kyc process for the user
      const updateUser = await axios({
        method: 'PATCH',
        url: `${CONSTANTS.apiURL}/user/${user.id}`,
        data: {
          kyc: {
            state: 'A'
          }
        },
        withCredentials: true
      });
      if (updateUser?.data) {
        console.log(`kyc done for User ${user.id}`);
      }

      //user login to application
      const userLogin = await axios({
        method: 'POST',
        url: `${CONSTANTS.apiURL}/login`,
        data: {
          address: user.address,
          signature: userSignature
        },
        withCredentials: true
      });
      userToken = userLogin.headers['set-cookie'][0];
    }

    //get user contribution
    const { votes, contribution } = await userContribution(i);
    console.log(
      `User ${i} contribution: ${JSON.stringify(votes)} and Total Amount: ${contribution}`
    );

    //sign typed data
    const { signature, data, domain } = await signTransferAuthorization(
      user.address,
      climateDAOContractAddress,
      contribution,
      CONSTANTS.validAfter,
      CONSTANTS.validBefore,
      '0x' + randombytes(32).toString('hex'),
      user.key,
      usdcContractAddress
    );

    //user contributes to projects
    const contributionTxn = await axios({
      method: 'POST',
      url: `${CONSTANTS.apiURL}/contribution`,
      data: {
        signature: signature,
        votes: votes,
        contribution: contribution,
        data: data,
        domain: domain
      },
      headers: {
        Cookie: [userToken]
      },
      withCredentials: true
    });
    if (contributionTxn?.data) {
      console.log(
        `RelayTransactionHash: ${contributionTxn.data.contribution.relayTransactionHash}`
      );
    }
    await verifyContribution(userToken);
  }
};

const main = async () => {
  await deployContracts();
};

main();
