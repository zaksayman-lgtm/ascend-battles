const hre = require("hardhat");

async function main() {
  console.log("Deploying AscendBattlesV2 to HyperEVM Testnet...");

  const AscendBattlesV2 = await hre.ethers.getContractFactory("AscendBattlesV2");
  const contract = await AscendBattlesV2.deploy();

  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  
  console.log("\n----------------------------------------------------");
  console.log("AscendBattlesV2 deployment successful.");
  console.log(`Contract Address: ${contractAddress}`);
  console.log(`Explorer Link:    https://explore-testnet.hyperpc.app/address/${contractAddress}`);
  console.log("----------------------------------------------------\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
