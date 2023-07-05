/* eslint-disable no-unused-vars */
const ethers = require('ethers');
const fs = require('fs');
const ClimateDAO = require('./artifacts/ClimateDAO.json');
const USDCStub = require('./artifacts/USDCStub.json');

require('dotenv').config({ path: './.env' });

const vkJson = JSON.parse(
  fs.readFileSync(`./proving-files/decrypt-tally-hash/decrypt-tally-hash_vk.key`, 'utf-8')
);
const vk = Object.values(vkJson).flat(Infinity);

const startTime = Math.floor(Date.now() / 1000);

/**
 * Deploys a new contract based on the provided arguments
 *
 * @returns {object} - transaction receipt
 */
const deployContract = async (contractJson, wallet, provider, deployArgs) => {
  try {
    const factory = new ethers.ContractFactory(contractJson.abi, contractJson.bytecode, wallet);
    const { maxFeePerGas, maxPriorityFeePerGas } = await getGasPrice();

    let contractInstance;
    if (deployArgs) {
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
    } else {
      const transaction = factory.getDeployTransaction();

      const estimatedGasLimit = await provider.estimateGas(transaction);
      contractInstance = await factory.deploy({
        gasLimit: estimatedGasLimit,
        maxFeePerGas,
        maxPriorityFeePerGas
      });
    }
    await contractInstance.deployTransaction.wait(1);
    const receipt = await contractInstance.deployed();
    return { receipt };
  } catch (error) {
    console.log(`Error: ${error}`);
  }
};

const deployContracts = async () => {
  const provider = new ethers.providers.JsonRpcProvider(process.env.JSON_RPC);
  const wallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider);

  const usdcContract = await deployContract(USDCStub, wallet, provider);
  const usdcContractAddress = usdcContract.receipt.address;

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
    usdcContractAddress
  };

  const climateDAOContract = await deployContract(ClimateDAO, wallet, provider, inputArgs);
  const climateDAOContractAddress = climateDAOContract.receipt.address;
  console.log(`USDC Contract Address: ${usdcContractAddress}`);
  console.log(`ClimateDAO Contract Address: ${climateDAOContractAddress}`);
  await transferToken(usdcContractAddress, climateDAOContractAddress, USDCStub.abi);
};

/**
 * Transfers Bp's fund of 250k USDC to ClimateDAO contract.
 *
 * @param {address} contractAddress - USDC Contract Address
 * @param {address} toAddress - ClimateDAO Contract Address
 * @param {JSON} abi - Abi of USDC contract
 */
const transferToken = async (contractAddress, toAddress, abi) => {
  try {
    const provider = new ethers.providers.JsonRpcProvider(process.env.JSON_RPC);
    var signer = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider);
    const contractInstance = new ethers.Contract(contractAddress, abi, signer);
    const { maxFeePerGas, maxPriorityFeePerGas } = await getGasPrice();
    const transaction = await contractInstance.magicMint(toAddress, 250000000000, {
      gasLimit: 5000000,
      maxFeePerGas,
      maxPriorityFeePerGas
    });
    await transaction.wait(1);
    const balance = await contractInstance.balanceOf(toAddress);
    console.log(`Balance of ${toAddress} : ${balance}`);
  } catch (error) {
    console.log(`Error: ${error}`);
  }
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
    const chainId = Number(process.env.CHAIN_ID);
    const infuraProjectId = process.env.INFURA_PROJECT_ID;
    const infuraProvider = new ethers.providers.InfuraProvider(chainId, infuraProjectId);
    return infuraProvider;
  } catch (error) {
    console.log(`Error fetching infura provider: ${error}`);
  }
};

const main = async () => {
  await deployContracts();
};

main();
