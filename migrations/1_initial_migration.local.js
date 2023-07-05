const fs = require("fs");

const ClimateDAO = artifacts.require("ClimateDAO");
const USDCStub = artifacts.require("USDCStub");

const vkJson = JSON.parse(fs.readFileSync(`../proving-files/decrypt-tally-hash/decrypt-tally-hash_vk.key`, "utf-8"));
const vk = Object.values(vkJson).flat(Infinity);

// init start time to be now, or in 10 mins if we are running the timing test
const startTime = process.argv.find(elt => elt.includes('climateTiming.js')) ? Math.floor(Date.now()/1000) + 6000 : Math.floor(Date.now()/1000);

module.exports = function (deployer) {
  deployer.then(async () => {
    // this migrations file deploys a new USDC contract
    const usdcInstance = await deployer.deploy(USDCStub);
    const climateInstance = await deployer.deploy(
      ClimateDAO,
      [
        [1, "0xe94D592C6D972F574255aE4B58E4FbB5268155E6"],
        [2, "0x48A15FF342Cc95D8258d95358AFfCF689464EB3A"],
        [3, "0x24079020D2EB124dB1f79247bD9Cb0A72cdcba1F"],
        [4, "0x98C5998414def392bC11cb42Ce1F4A47BC119215"],
        [5, "0x510D2DC44d523a42Eb4520adC3F0935fd96bE2AC"]
      ],
      vk,
      startTime,
      usdcInstance.address, // ropsten USDC stub
      150000000000,
      20000000000
    );
    await usdcInstance.magicMint(climateInstance.address, 250000000000);
    console.log("balance", await usdcInstance.balanceOf(climateInstance.address));
    console.log("climateInstance", climateInstance.address);
    console.log("usdcInstance", usdcInstance.address);
  });
};
