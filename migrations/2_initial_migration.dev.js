const fs = require("fs");

const ClimateDAO = artifacts.require("ClimateDAO");
const USDCStub = artifacts.require("USDCStub");

const vkJson = JSON.parse(fs.readFileSync(`../proving-files-dev/decrypt-tally-hash_vk.key`, "utf-8"));
const vk = Object.values(vkJson).flat(Infinity);

// this migration file is used while we deploy to azure dev environment
module.exports = function (deployer) {
  deployer.then(async () => {
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
      Math.floor(Date.now()/1000),
      usdcInstance.address, // TODO: link to prod USDC contract
      150000000000,
      20000000000
    );
    await usdcInstance.magicMint(climateInstance.address, 250000000000);
    console.log("balance", await usdcInstance.balanceOf(climateInstance.address));
    console.log("climateInstance", climateInstance.address);
    console.log("usdcInstance", usdcInstance.address);
  });
};
