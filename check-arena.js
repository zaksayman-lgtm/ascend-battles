const { ethers } = require("ethers");
const fs = require("fs");
const config = require("./config");

async function main() {
    const provider = new ethers.providers.JsonRpcProvider(config.RPC_URL);
    const abi = JSON.parse(fs.readFileSync("./contracts_PredictionMarket_sol_PredictionMarket.abi", "utf8"));
    const contract = new ethers.Contract(config.CONTRACT_ADDRESS, abi, provider);

    try {
        const arena = await contract.arenas(2);
        console.log("Arena #2 Data:", arena);
    } catch (err) {
        console.log("Error fetching Arena #2:", err.message);
    }
}

main();
