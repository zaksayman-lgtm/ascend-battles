import hre from "hardhat";

async function main() {
  const AscendBattles = await hre.ethers.getContractFactory("AscendBattles");
  const battles = await AscendBattles.deploy();
  await battles.waitForDeployment();

  console.log("AscendBattles deployed to:", await battles.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
