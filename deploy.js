const { ethers } = require("ethers");
const fs = require("fs");

async function main() {
    // Elysium Kinetiq Testnet configuration
    const provider = new ethers.providers.StaticJsonRpcProvider(
        "https://testnet-rpc.elysium.kinetiq.xyz",
        { name: "elysium-testnet", chainId: 99801 }
    );
    
    const privateKey = "0x9e0a050505494a148efdc6737ac158144f4567c1e8b2367e245d8165965876c5";
    const wallet = new ethers.Wallet(privateKey, provider);

    console.log("Deploying contract with account:", wallet.address);

    const abi = JSON.parse(fs.readFileSync("./contracts_PredictionMarket_sol_PredictionMarket.abi", "utf8"));
    const bytecode = "0x" + fs.readFileSync("./contracts_PredictionMarket_sol_PredictionMarket.bin", "utf8").trim();

    const Factory = new ethers.ContractFactory(abi, bytecode, wallet);
    
    console.log("Deploying PredictionMarket to Elysium Testnet...");
    
    const contract = await Factory.deploy({
        gasLimit: 3000000
    });

    console.log("Transaction sent! Hash:", contract.deployTransaction.hash);
    console.log("Waiting for confirmation...");
    await contract.deployed();

    console.log("✅ PredictionMarket deployed successfully!");
    console.log("Contract Address:", contract.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
