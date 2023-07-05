/* eslint-disable no-unused-vars */
const ethers = require('ethers');
const fs = require('fs');
const ClimateDAO = require('./artifacts/ClimateDAO.json');

const vkJson = JSON.parse(
  fs.readFileSync(`./proving-files-prod/decrypt-tally-hash_vk.key`, 'utf-8')
);
const vk = Object.values(vkJson).flat(Infinity);

const startTime = Math.floor(Date.now() / 1000);
const CHAIN_ID = 1;
const JSON_RPC = '';
const ADMIN_PRIVATE_KEY = '';
const USDC_CONTRACT = '';
const INFURA_PROJECT_ID = '';
const PROJECT_1_ADDRESS = '';
const PROJECT_2_ADDRESS = '';
const PROJECT_3_ADDRESS = '';
const PROJECT_4_ADDRESS = '';
const PROJECT_5_ADDRESS = '';

/**
 * Deploys a new contract
 *
 * @returns {object} - transaction receipt
 */
const deployContract = async (contractJson, wallet, deployArgs) => {
  try {
    const factory = new ethers.ContractFactory(contractJson.abi, contractJson.bytecode, wallet);
    const { maxFeePerGas, maxPriorityFeePerGas } = await getGasPrice();

    let contractInstance;
    const { projects, vk, startTime, usdcContractAddress } = deployArgs;

    contractInstance = await factory.deploy(
      projects,
      vk,
      startTime,
      usdcContractAddress,
      150000000000,
      20000000000,
      {
        gasLimit: 7000000,
        maxFeePerGas,
        maxPriorityFeePerGas
      }
    );
    await contractInstance.deployTransaction.wait();
    const receipt = await contractInstance.deployed();
    return { receipt };
  } catch (error) {
    console.log(`Error: ${error}`);
  }
};

const deployContracts = async () => {
  const provider = new ethers.providers.JsonRpcProvider(JSON_RPC);
  const wallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);
  const usdcContractAddress = USDC_CONTRACT;

  const projects = [
    [1, PROJECT_1_ADDRESS],
    [2, PROJECT_2_ADDRESS],
    [3, PROJECT_3_ADDRESS],
    [4, PROJECT_4_ADDRESS],
    [5, PROJECT_5_ADDRESS]
  ];
  const inputArgs = {
    projects,
    vk,
    startTime,
    usdcContractAddress
  };

  const climateDAOContract = await deployContract(ClimateDAO, wallet, inputArgs);
  const climateDAOContractAddress = climateDAOContract.receipt.address;
  console.log(`USDC Contract Address: ${usdcContractAddress}`);
  console.log(`ClimateDAO Contract Address: ${climateDAOContractAddress}`);
};

/**
 * Returns the current maxFeePerGas, maxPriorityFeePerGas
 * @returns {object} - maxFeePerGas, maxPriorityFeePerGas
 */
const getGasPrice = async () => {
  try {
    const provider = await getInfuraProvider();
    const { maxFeePerGas, maxPriorityFeePerGas } = await provider.getFeeData();
    return { maxFeePerGas, maxPriorityFeePerGas };
  } catch (error) {
    console.log(`Error fetching fee data: ${error}`);
  }
};

/**
 * Returns the provider instance for the given infura project id
 * @returns {ethers.Provider} - Infura provider instance
 */
const getInfuraProvider = async () => {
  try {
    const chainId = Number(CHAIN_ID);
    const infuraProjectId = INFURA_PROJECT_ID;
    const infuraProvider = new ethers.providers.InfuraProvider(chainId, infuraProjectId);
    return infuraProvider;
  } catch (error) {
    console.log(`Error fetching infura provider: ${error}`);
  }
};

const main = async () => {
  await deployContracts();
};

// this script is used to deploy contract to Ethereum mainnet
main();
