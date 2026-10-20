const { ethers } = require('ethers');
const solc = require('solc');
const fs = require('fs');
const readline = require('readline');

const RPC_URLS = [
    "https://rpc.elysium.kinetiq.xyz",
    "https://testnet-rpc.elysium.kinetiq.xyz",
    "https://rpc-testnet.elysium.kinetiq.xyz"
];
const CHAIN_ID = 99801;
const USDC_TOKEN_ADDRESS = "0x2B3370eE501B4a559b57D449569354196457D8Ab";

const contractSource = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
}

contract AscendBattlesV2 {
    address public owner;
    IERC20 public usdcToken;
    mapping(uint256 => uint256) public sponsorPools;

    event SponsorFunded(uint256 indexed roundId, address indexed sponsor, uint256 amount);
    event RewardClaimed(uint256 indexed roundId, address indexed player, uint256 amount);

    constructor(address _usdcToken) {
        owner = msg.sender;
        usdcToken = IERC20(_usdcToken);
    }

    function fundSponsorPool(uint256 roundId, uint256 amount) external {
        require(amount > 0, "Amount must be > 0");
        require(usdcToken.transferFrom(msg.sender, address(this), amount), "USDC Transfer failed");
        sponsorPools[roundId] += amount;
        emit SponsorFunded(roundId, msg.sender, amount);
    }

    function claim(uint256 roundId) external {
        uint256 reward = 10 * 10**6;
        require(sponsorPools[roundId] >= reward, "Insufficient pool balance");
        sponsorPools[roundId] -= reward;
        require(usdcToken.transfer(msg.sender, reward), "Reward transfer failed");
        emit RewardClaimed(roundId, msg.sender, reward);
    }
}
`;

function compileContract() {
    console.log("⚙️ Compiling AscendBattlesV2.sol...");
    const input = {
        language: 'Solidity',
        sources: { 'AscendBattlesV2.sol': { content: contractSource } },
        settings: { outputSelection: { '*': { '*': ['abi', 'evm.bytecode'] } } }
    };
    const output = JSON.parse(solc.compile(JSON.stringify(input)));
    const contract = output.contracts['AscendBattlesV2.sol']['AscendBattlesV2'];
    return { abi: contract.abi, bytecode: contract.evm.bytecode.object };
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question("Enter your wallet Private Key: ", async (privateKey) => {
    rl.close();
    
    let provider = null;
    let wallet = null;

    for (const rpc of RPC_URLS) {
        try {
            console.log("📡 Attempting connection to:", rpc);
            const tempProvider = new ethers.providers.StaticJsonRpcProvider(rpc, { name: "elysium", chainId: CHAIN_ID });
            const tempWallet = new ethers.Wallet(privateKey.trim(), tempProvider);
            const bal = await tempProvider.getBalance(tempWallet.address);
            provider = tempProvider;
            wallet = tempWallet;
            console.log("✅ Connected successfully via:", rpc);
            console.log("💰 HYPE Balance:", ethers.utils.formatEther(bal), "HYPE");
            break;
        } catch (e) {
            console.log("⚠️ Connection failed for:", rpc);
        }
    }

    if (!provider || !wallet) {
        console.error("❌ Could not connect to any Elysium RPC endpoint.");
        return;
    }

    try {
        const { abi, bytecode } = compileContract();
        console.log("🚀 Deploying AscendBattlesV2 on-chain to Elysium...");
        const factory = new ethers.ContractFactory(abi, bytecode, wallet);
        const contract = await factory.deploy(USDC_TOKEN_ADDRESS);
        
        console.log("⏳ Waiting for block confirmation...");
        await contract.deployed();

        console.log("\n🎉 DEPLOYMENT SUCCESSFUL!");
        console.log("📍 Deployed Contract Address:", contract.address);

        ["index.html", "admin.html"].forEach(file => {
            if (fs.existsSync(file)) {
                let content = fs.readFileSync(file, 'utf8');
                content = content.replace(/const CONTRACT_ADDRESS = "[^"]+";/, `const CONTRACT_ADDRESS = "${contract.address}";`);
                fs.writeFileSync(file, content);
                console.log("✅ Updated contract address in " + file);
            }
        });

    } catch (err) {
        console.error("❌ Deployment failed:", err.reason || err.message || err);
    }
});
