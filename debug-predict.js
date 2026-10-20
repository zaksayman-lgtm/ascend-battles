const { ethers } = require("ethers");
const fs = require("fs");
const config = require("./config");

async function main() {
    const provider = new ethers.providers.JsonRpcProvider(config.RPC_URL);
    const abi = JSON.parse(fs.readFileSync("./contracts_PredictionMarket_sol_PredictionMarket.abi", "utf8"));
    const contract = new ethers.Contract(config.CONTRACT_ADDRESS, abi, provider);

    try {
        // Try calling static to catch the exact revert reason
        await contract.callStatic.predict(2, 1, { from: "0xe11000000000000000000000000000000000cec4" });
        console.log("Static call succeeded!");
    } catch (err) {
        console.log("Revert Reason:", err.reason || err.message);
    }
}

main();
