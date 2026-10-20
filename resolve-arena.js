const { ethers } = require("ethers");
const fs = require("fs");
const config = require("./config");

async function main() {
    const provider = new ethers.providers.JsonRpcProvider(config.RPC_URL);
    const wallet = new ethers.Wallet("0x9e0a050505494a148efdc6737ac158144f4567c1e8b2367e245d8165965876c5", provider);

    const abi = JSON.parse(fs.readFileSync("./contracts_PredictionMarket_sol_PredictionMarket.abi", "utf8"));
    const contract = new ethers.Contract(config.CONTRACT_ADDRESS, abi, wallet);

    console.log("Resolving Arena ID 1... Declaring Team 1 (Project Alpha) as Winner!");

    // Calling resolveArena(arenaId, winner)
    const tx = await contract.resolveArena(1, 1, {
        gasLimit: 300000
    });

    console.log("Transaction sent! Hash:", tx.hash);
    console.log("Waiting for confirmation...");

    const receipt = await tx.wait();
    console.log("✅ Arena resolved successfully in block:", receipt.blockNumber);
    console.log("Status:", receipt.status === 1 ? "SUCCESS (1)" : "FAILED (0)");

    // Inspect updated arena state
    const arena = await contract.arenas(1);
    console.log("\n--- Updated Arena 1 Details ---");
    console.log("Active Status:", arena.active);
    console.log("Declared Winner:", arena.winner.toString());
}

main().catch(console.error);
