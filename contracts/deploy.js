import fs from 'fs';
import { ethers } from 'ethers';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  const provider = new ethers.JsonRpcProvider("https://rpc.hyperliquid-testnet.xyz/evm");

  if (!process.env.PRIVATE_KEY || process.env.PRIVATE_KEY === "0x0000000000000000000000000000000000000000000000000000000000000000") {
    console.log("\n[!] Replace PRIVATE_KEY in .env with your actual private key before deploying.");
    console.log("File path: ~/ascend-battles/contracts/.env");
    process.exit(1);
  }

  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  console.log("Deploying contract with account:", wallet.address);

  const artifact = JSON.parse(fs.readFileSync('./build/AscendBattles.json', 'utf8'));
  const factory = new ethers.ContractFactory(artifact.abi, artifact.evm.bytecode.object, wallet);

  const contract = await factory.deploy();
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log("\nSuccess! AscendBattles deployed to:", contractAddress);
  
  fs.writeFileSync('../frontend/.env', `VITE_CONTRACT_ADDRESS=${contractAddress}\n`);
  console.log("Updated frontend environment file with deployed address.");
}

main().catch(err => {
  console.error("Deployment error:", err);
  process.exit(1);
});
