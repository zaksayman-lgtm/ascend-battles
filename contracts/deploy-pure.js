import fs from 'fs';
import path from 'path';
import solc from 'solc';
import { ethers } from 'ethers';

async function main() {
  console.log("Compiling AscendBattles.sol with pure JS compiler...");

  // 1. Locate and read contract
  const contractPath = path.resolve('contracts', 'AscendBattles.sol');
  const source = fs.readFileSync(contractPath, 'utf8');

  // 2. Configure solc input
  const input = {
    language: 'Solidity',
    sources: {
      'AscendBattles.sol': { content: source }
    },
    settings: {
      optimizer: { enabled: true, runs: 200 },
      outputSelection: {
        '*': { '*': ['abi', 'evm.bytecode'] }
      }
    }
  };

  // Import handler for OpenZeppelin or relative imports
  function findImports(importPath) {
    try {
      const fullPath = path.resolve('node_modules', importPath);
      return { contents: fs.readFileSync(fullPath, 'utf8') };
    } catch (e) {
      return { error: 'File not found' };
    }
  }

  // 3. Compile
  const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));

  if (output.errors) {
    const errors = output.errors.filter(e => e.severity === 'error');
    if (errors.length > 0) {
      console.error("Compilation Errors:", errors);
      process.exit(1);
    }
  }

  const contractData = output.contracts['AscendBattles.sol']['AscendBattles'];
  const abi = contractData.abi;
  const bytecode = contractData.evm.bytecode.object;

  console.log("Compilation successful! Deploying to HyperEVM...");

  // 4. Deploy contract
  const provider = new ethers.JsonRpcProvider('https://rpc.hyperliquid-testnet.xyz/evm');
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const factory = new ethers.ContractFactory(abi, bytecode, wallet);

  const contract = await factory.deploy();
  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log(`\nSuccess! AscendBattles deployed to: ${address}`);

  // 5. Save address to frontend .env
  try {
    const envPath = '../frontend/.env';
    let envContent = fs.readFileSync(envPath, 'utf8');
    if (envContent.includes('VITE_CONTRACT_ADDRESS=')) {
      envContent = envContent.replace(/VITE_CONTRACT_ADDRESS=.*/, `VITE_CONTRACT_ADDRESS=${address}`);
    } else {
      envContent += `\nVITE_CONTRACT_ADDRESS=${address}`;
    }
    fs.writeFileSync(envPath, envContent);
    console.log("Updated frontend/.env with deployed address.");
  } catch (err) {
    console.log("Could not auto-update frontend/.env (file missing or skipped).");
  }
}

main().catch((err) => {
  console.error("Deployment failed:", err);
  process.exit(1);
});
