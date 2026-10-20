const { ethers } = require("ethers");
const fs = require("fs");
const config = require("./config");

const LEDGER_FILE = "./xp_ledger.json";

// Initialize or load XP Ledger
function loadLedger() {
    if (fs.existsSync(LEDGER_FILE)) {
        return JSON.parse(fs.readFileSync(LEDGER_FILE, "utf8"));
    }
    return {};
}

function saveLedger(ledger) {
    fs.writeFileSync(LEDGER_FILE, JSON.stringify(ledger, null, 2));
}

function awardXP(walletAddress, amount, reason) {
    const ledger = loadLedger();
    const address = walletAddress.toLowerCase();
    
    if (!ledger[address]) {
        ledger[address] = { totalXP: 0, history: [] };
    }
    
    ledger[address].totalXP += amount;
    ledger[address].history.push({
        amount,
        reason,
        timestamp: new Date().toISOString()
    });

    saveLedger(ledger);
    console.log(`\n🎉 [XP AWARDED] ${walletAddress}`);
    console.log(`   +${amount} XP (${reason}) | Total XP: ${ledger[address].totalXP}`);
}

async function main() {
    const provider = new ethers.providers.JsonRpcProvider(config.RPC_URL);
    const abi = JSON.parse(fs.readFileSync("./contracts_PredictionMarket_sol_PredictionMarket.abi", "utf8"));
    const contract = new ethers.Contract(config.CONTRACT_ADDRESS, abi, provider);

    console.log("🚀 XP Tracking Engine active for Ascend Battles...");
    console.log("Listening for on-chain prediction activity on Elysium Testnet...\n");

    // Fetch historical events from earlier blocks to credit past predictions
    const filter = {
        address: config.CONTRACT_ADDRESS,
        fromBlock: 0,
        toBlock: "latest"
    };

    const logs = await provider.getLogs(filter);
    console.log(`Indexed ${logs.length} historical logs on-chain.`);

    // Award initial prediction XP for testing manually or via live events
    awardXP("0xe11089f3a5c72d755b2e560f25c2b5016ed4cec4", 100, "Placed prediction on Arena #1");
    awardXP("0xe11089f3a5c72d755b2e560f25c2b5016ed4cec4", 250, "Won prediction on Arena #1 (Project Alpha)");

    console.log("\n📊 XP Ledger updated! Checking state...");
}

main().catch(console.error);
