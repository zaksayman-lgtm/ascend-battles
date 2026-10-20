const { ethers } = require('ethers');
const fs = require('fs');

async function testPredictAndClaim() {
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) throw new Error("PRIVATE_KEY not found in environment.");

    const provider = new ethers.providers.StaticJsonRpcProvider("https://rpc.hyperliquid-testnet.xyz/evm");
    const wallet = new ethers.Wallet(privateKey, provider);
    const abi = JSON.parse(fs.readFileSync('abi.json', 'utf8'));

    const contractAddress = "0x0CFB62582125433D98B6cd21FF037708D6FB9e16";
    const contract = new ethers.Contract(contractAddress, abi, wallet);

    const roundId = 1;
    const predictedOutcome = 1;
    const stakeAmount = ethers.utils.parseEther("0.001");

    console.log(`1. Placing prediction on Round ${roundId}, Outcome ${predictedOutcome} with ${ethers.utils.formatEther(stakeAmount)} ETH/HYPER...`);
    const predictTx = await contract.predict(roundId, predictedOutcome, { value: stakeAmount });
    console.log(`Prediction Tx: ${predictTx.hash}`);
    await predictTx.wait();
    console.log("Prediction confirmed on-chain!");

    console.log("\n2. Querying updated pool size...");
    const roundData = await contract.rounds(roundId);
    console.log(`Total Native Pool: ${ethers.utils.formatEther(roundData.totalNativePool)} ETH/HYPER`);

    console.log(`\n3. Resolving Round ${roundId} (Winning Outcome = ${predictedOutcome})...`);
    const resolveTx = await contract.resolveRound(roundId, predictedOutcome);
    console.log(`Resolve Tx: ${resolveTx.hash}`);
    await resolveTx.wait();
    console.log("Round resolved on-chain!");

    console.log(`\n4. Claiming reward for Round ${roundId}...`);
    const claimTx = await contract.claim(roundId);
    console.log(`Claim Tx: ${claimTx.hash}`);
    await claimTx.wait();
    console.log("Payout claimed successfully!");
}

testPredictAndClaim().catch(console.error);
