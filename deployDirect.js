const fs = require('fs');
const solc = require('solc');
const { ethers } = require('ethers');

// Official Circle USDC Testnet Address on HyperEVM
const USDC_TESTNET_ADDRESS = "0x2B3370eE501B4a559b57D449569354196457D8Ab"; 

async function main() {
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) throw new Error("Error: PRIVATE_KEY environment variable not set.");

    console.log("1. Reading upgraded AscendBattlesV2.sol...");
    const source = fs.readFileSync('contracts/AscendBattlesV2.sol', 'utf8');

    const input = {
        language: 'Solidity',
        sources: { 'AscendBattlesV2.sol': { content: source } },
        settings: { outputSelection: { '*': { '*': ['*'] } } }
    };

    console.log("2. Compiling with pure JavaScript solc...");
    const output = JSON.parse(solc.compile(JSON.stringify(input)));
    
    if (output.errors) {
        output.errors.forEach(err => console.error(err.formattedMessage));
        if (output.errors.some(e => e.severity === 'error')) process.exit(1);
    }

    const contractData = output.contracts['AscendBattlesV2.sol']['AscendBattlesV2'];
    const abi = contractData.abi;
    const bytecode = contractData.evm.bytecode.object;

    console.log("3. Connecting to HyperEVM Testnet...");
    const provider = new ethers.providers.StaticJsonRpcProvider("https://rpc.hyperliquid-testnet.xyz/evm");
    const wallet = new ethers.Wallet(privateKey, provider);
    const factory = new ethers.ContractFactory(abi, bytecode, wallet);

    console.log("4. Deploying USDC-enabled contract...");
    const contract = await factory.deploy(USDC_TESTNET_ADDRESS);
    console.log("Waiting for block confirmation...");
    await contract.deployTransaction.wait();

    console.log("\n----------------------------------------------------");
    console.log("AscendBattlesV2 (USDC Reward Enabled) Deployed!");
    console.log(`Contract Address: ${contract.address}`);
    console.log(`Explorer Link:    https://explore-testnet.hyperpc.app/address/${contract.address}`);
    console.log("----------------------------------------------------\n");
}

main().catch(console.error);
