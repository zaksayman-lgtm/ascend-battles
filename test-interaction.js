const { ethers } = require("ethers");
const fs = require("fs");
const config = require("./config");

async function main() {
    const provider = new ethers.providers.JsonRpcProvider(config.RPC_URL);
    const wallet = new ethers.Wallet("0x9e0a050505494a148efdc6737ac158144f4567c1e8b2367e245d8165965876c5", provider);

    const abi = JSON.parse(fs.readFileSync("./contracts_PredictionMarket_sol_PredictionMarket.abi", "utf8"));
    const contract = new ethers.Contract(config.CONTRACT_ADDRESS, abi, wallet);

    console.log("✅ Successfully connected to PredictionMarket!");
    console.log("Contract Address:", contract.address);
    console.log("Wallet Address:", wallet.address);
}

main().catch(console.error);
