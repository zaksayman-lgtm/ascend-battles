const { ethers } = require("ethers");
const fs = require("fs");
const config = require("./config");

async function main() {
    const provider = new ethers.providers.JsonRpcProvider(config.RPC_URL);
    const wallet = new ethers.Wallet("0x9e0a050505494a148efdc6737ac158144f4567c1e8b2367e245d8165965876c5", provider);

    const abi = JSON.parse(fs.readFileSync("./contracts_PredictionMarket_sol_PredictionMarket.abi", "utf8"));
    const contract = new ethers.Contract(config.CONTRACT_ADDRESS, abi, wallet);

    console.log("Creating a test battle arena (Project Alpha vs Project Beta)...");
    
    const tx = await contract.createArena("Project Alpha", "Project Beta", {
        gasLimit: 500000
    });

    console.log("Transaction sent! Hash:", tx.hash);
    console.log("Waiting for confirmation...");
    
    const receipt = await tx.wait();
    console.log("✅ Arena created successfully in block:", receipt.blockNumber);

    const count = await contract.arenaCount();
    console.log("Total Arenas in Contract:", count.toString());
}

main().catch(console.error);
