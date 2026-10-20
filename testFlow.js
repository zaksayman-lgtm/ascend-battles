const { ethers } = require('ethers');
const fs = require('fs');

async function test() {
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) throw new Error("PRIVATE_KEY not found in environment.");

    const provider = new ethers.providers.StaticJsonRpcProvider("https://rpc.hyperliquid-testnet.xyz/evm");
    const wallet = new ethers.Wallet(privateKey, provider);
    const abi = JSON.parse(fs.readFileSync('abi.json', 'utf8'));
    
    // Contract Address from web3config.js
    const contractAddress = "0x0CFB62582125433D98B6cd21FF037708D6FB9e16";
    const contract = new ethers.Contract(contractAddress, abi, wallet);

    console.log("1. Starting Round 1 on HyperEVM Testnet...");
    const startTx = await contract.startRound();
    console.log(`Transaction sent: ${startTx.hash}`);
    await startTx.wait();
    console.log("Round 1 officially started!");

    console.log("\n2. Querying Round 1 details from blockchain...");
    const currentRoundId = await contract.currentRoundId();
    const roundData = await contract.rounds(currentRoundId);

    console.log("----------------------------------------------------");
    console.log(`Active Round ID: ${currentRoundId.toString()}`);
    console.log(`Total Native Pool: ${ethers.utils.formatEther(roundData.totalNativePool)} ETH/HYPER`);
    console.log(`Total USDC Pool: ${roundData.totalUsdcRewardPool.toString()} units`);
    console.log(`Resolved: ${roundData.resolved}`);
    console.log("----------------------------------------------------");
}

test().catch(console.error);
