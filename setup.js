const fs = require('fs');
const http = require('http');

const htmlContent = `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AscendBattles V2 | OKX XP Predictions</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/ethers/5.7.2/ethers.umd.min.js"></script>
    <style>
        body { background-color: #0B0E11; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        .okx-card { background-color: #181A20; border: 1px solid #2B2F36; }
        .okx-input { background-color: #0B0E11; border: 1px solid #2B2F36; }
        .okx-input:focus { border-color: #20B26C; outline: none; }
        .okx-btn-green { background-color: #20B26C; color: #000000; font-weight: 700; }
        .okx-btn-green:hover { background-color: #25C97B; }
        .okx-pill { background-color: #2B2F36; color: #848E9C; }
    </style>
</head>
<body class="text-gray-100 min-h-screen flex flex-col items-center p-3 sm:p-6">

    <header class="w-full max-w-lg flex justify-between items-center py-3 px-4 okx-card rounded-xl mb-4">
        <div class="flex items-center space-x-2">
            <div class="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
            <span class="font-black text-base tracking-tight text-white">ASCEND<span class="text-emerald-400">BATTLES</span></span>
            <span class="text-[10px] okx-pill px-2 py-0.5 rounded font-mono">HYPEREVM 998</span>
        </div>
        <button id="connectBtn" onclick="connectWallet()" class="okx-btn-green text-xs px-3.5 py-2 rounded-lg transition">
            Connect Wallet
        </button>
    </header>

    <div id="walletInfo" class="hidden w-full max-w-lg okx-card rounded-xl p-3 mb-4 text-xs flex justify-between text-gray-400 font-mono">
        <span>Address: <strong id="userAddress" class="text-emerald-400">0x00...00</strong></span>
        <span>Available XP: <strong id="userXPDisplay" class="text-amber-400 font-bold">100 XP</strong></span>
    </div>

    <main class="w-full max-w-lg okx-card rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4">
        <div class="flex justify-between items-center text-xs">
            <div class="flex space-x-2">
                <span class="okx-pill px-2.5 py-1 rounded-md text-gray-300 font-medium">FREE-TO-PLAY XP</span>
                <span id="sponsoredBadge" class="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-md font-semibold">★ $USDC BOOSTED</span>
            </div>
            <span class="text-gray-400 font-mono">LIVE ROUND #1</span>
        </div>

        <div>
            <h2 class="text-lg font-bold text-white tracking-wide">Battle Arena Round 1</h2>
            <p class="text-xs text-gray-400">Stake XP points gasless to win native XP pools & USDC prizes.</p>
        </div>

        <div class="grid grid-cols-2 gap-3">
            <div class="okx-input p-3 rounded-xl border">
                <span class="text-[11px] text-gray-400 uppercase font-semibold block mb-1">Total Staked Pool</span>
                <span id="nativePool" class="text-base font-extrabold text-amber-400 font-mono">50 XP</span>
            </div>
            <div class="okx-input p-3 rounded-xl border">
                <span class="text-[11px] text-emerald-400 uppercase font-semibold block mb-1">USDC Sponsor Pool</span>
                <span id="usdcPool" class="text-base font-extrabold text-emerald-400 font-mono">$50.00 USDC</span>
            </div>
        </div>

        <div class="space-y-1.5">
            <div class="flex justify-between text-xs font-mono font-bold">
                <span class="text-emerald-400">Outcome 1 (50%)</span>
                <span class="text-amber-400">Outcome 2 (50%)</span>
            </div>
            <div class="w-full h-2 bg-gray-800 rounded-full overflow-hidden flex">
                <div id="bar1" class="bg-emerald-500 h-full transition-all duration-300" style="width: 50%"></div>
                <div id="bar2" class="bg-amber-500 h-full transition-all duration-300" style="width: 50%"></div>
            </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
            <button id="tile1" onclick="selectOutcome(1)" class="okx-input p-3 rounded-xl text-left border-2 border-emerald-500 bg-emerald-500/10 transition">
                <div class="flex justify-between items-center mb-1">
                    <span class="text-xs font-bold text-emerald-400 uppercase">Outcome 1</span>
                    <span class="text-[10px] okx-pill px-1.5 py-0.5 rounded text-white">SELECTED</span>
                </div>
                <div class="text-lg font-black text-white font-mono" id="mult1">2.00x</div>
                <div class="text-[11px] text-gray-400">XP Multiplier</div>
            </button>

            <button id="tile2" onclick="selectOutcome(2)" class="okx-input p-3 rounded-xl text-left border border-gray-800 hover:border-gray-700 transition">
                <div class="flex justify-between items-center mb-1">
                    <span class="text-xs font-bold text-amber-400 uppercase">Outcome 2</span>
                </div>
                <div class="text-lg font-black text-white font-mono" id="mult2">2.00x</div>
                <div class="text-[11px] text-gray-400">XP Multiplier</div>
            </button>
        </div>

        <div class="space-y-2">
            <div class="flex justify-between text-xs text-gray-400">
                <span>Prediction Stake</span>
                <span>Available: <strong id="userAvailXP" class="text-amber-400 font-bold">100 XP</strong></span>
            </div>
            <div class="relative">
                <input id="stakeInput" type="number" step="1" placeholder="10" oninput="updatePayoutCalc()" class="w-full okx-input rounded-xl py-3 pl-3 pr-16 text-white font-mono text-base font-bold">
                <span class="absolute right-3 top-3 text-xs font-bold text-amber-400">XP</span>
            </div>

            <div class="grid grid-cols-4 gap-2 text-xs font-bold font-mono">
                <button onclick="addStake(5)" class="okx-pill py-2 rounded-lg hover:bg-gray-700 transition text-gray-200">+5</button>
                <button onclick="addStake(10)" class="okx-pill py-2 rounded-lg hover:bg-gray-700 transition text-gray-200">+10</button>
                <button onclick="addStake(25)" class="okx-pill py-2 rounded-lg hover:bg-gray-700 transition text-gray-200">+25</button>
                <button onclick="setMaxStake()" class="okx-pill py-2 rounded-lg hover:bg-gray-700 transition text-emerald-400">MAX</button>
            </div>
        </div>

        <div class="okx-input p-3 rounded-xl space-y-2 text-xs font-mono">
            <div class="flex justify-between">
                <span class="text-gray-400">Estimated Return</span>
                <span id="estPayout" class="text-amber-400 font-extrabold text-sm">0 XP</span>
            </div>
            <div class="flex justify-between text-[11px] text-gray-500">
                <span>Staking Fee</span>
                <span class="text-emerald-400">0.00 (Gasless)</span>
            </div>
        </div>

        <button id="predictBtn" onclick="placePrediction()" class="w-full okx-btn-green py-3.5 rounded-xl text-sm font-black uppercase tracking-wider transition">
            Confirm XP Prediction
        </button>

        <button id="claimBtn" onclick="claimRewards()" class="w-full bg-gray-800 hover:bg-gray-700 text-emerald-400 border border-emerald-500/30 py-3 rounded-xl text-xs font-bold uppercase transition">
            Claim Pending USDC Rewards
        </button>

        <div id="statusLog" class="text-center text-[11px] font-mono text-gray-500">
            Connect Web3 wallet to claim your initial 100 XP balance.
        </div>
    </main>

    <script>
        const CONTRACT_ADDRESS = "0x0CFB62582125433D98B6cd21FF037708D6FB9e16";
        let provider, signer, userAddress, selectedOutcome = 1;
        let userXP = 100;
        let totalPoolXP = 50;

        async function connectWallet() {
            if (!window.ethereum) return alert("Open in Web3 Browser (MetaMask/OKX/Coinbase)");
            provider = new ethers.providers.Web3Provider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            signer = provider.getSigner();
            userAddress = await signer.getAddress();

            document.getElementById("connectBtn").innerText = userAddress.substring(0,6) + "..." + userAddress.substring(38);
            document.getElementById("userAddress").innerText = userAddress.substring(0,6) + "..." + userAddress.substring(38);
            document.getElementById("walletInfo").classList.remove("hidden");

            updateXPBalances();
            document.getElementById("statusLog").innerText = "Wallet connected! 100 XP loaded.";
        }

        function updateXPBalances() {
            document.getElementById("userXPDisplay").innerText = userXP.toLocaleString() + " XP";
            document.getElementById("userAvailXP").innerText = userXP.toLocaleString() + " XP";
        }

        function selectOutcome(outcome) {
            selectedOutcome = outcome;
            const tile1 = document.getElementById("tile1");
            const tile2 = document.getElementById("tile2");

            if (outcome === 1) {
                tile1.className = "okx-input p-3 rounded-xl text-left border-2 border-emerald-500 bg-emerald-500/10 transition";
                tile2.className = "okx-input p-3 rounded-xl text-left border border-gray-800 hover:border-gray-700 transition";
            } else {
                tile2.className = "okx-input p-3 rounded-xl text-left border-2 border-amber-500 bg-amber-500/10 transition";
                tile1.className = "okx-input p-3 rounded-xl text-left border border-gray-800 hover:border-gray-700 transition";
            }
            updatePayoutCalc();
        }

        function addStake(val) {
            const input = document.getElementById("stakeInput");
            const curr = parseInt(input.value || "0");
            input.value = curr + val;
            updatePayoutCalc();
        }

        function setMaxStake() {
            document.getElementById("stakeInput").value = userXP;
            updatePayoutCalc();
        }

        function updatePayoutCalc() {
            const stake = parseInt(document.getElementById("stakeInput").value || "0");
            const mult = 2.00;
            const est = Math.floor(stake * mult);
            document.getElementById("estPayout").innerText = est.toLocaleString() + " XP";
        }

        function placePrediction() {
            if (!signer) return alert("Connect wallet first!");
            const stake = parseInt(document.getElementById("stakeInput").value || "0");
            if (stake <= 0) return alert("Enter valid XP stake!");
            if (stake > userXP) return alert("Insufficient XP balance!");

            userXP -= stake;
            totalPoolXP += stake;
            
            updateXPBalances();
            document.getElementById("nativePool").innerText = totalPoolXP.toLocaleString() + " XP";
            document.getElementById("stakeInput").value = "";
            document.getElementById("estPayout").innerText = "0 XP";
            
            document.getElementById("statusLog").innerText = \`Successfully placed \${stake} XP on Outcome \${selectedOutcome}!\`;
        }

        async function claimRewards() {
            if (!signer) return alert("Connect wallet first!");
            try {
                document.getElementById("statusLog").innerText = "Connecting to HyperEVM for USDC claim...";
                const abi = ["function claim(uint256 roundId) external"];
                const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
                const tx = await contract.claim(1);
                document.getElementById("statusLog").innerText = "Claim Tx pending: " + tx.hash;
                await tx.wait();
                document.getElementById("statusLog").innerText = "USDC Sponsor Reward claimed successfully on-chain!";
            } catch (err) {
                console.error(err);
                document.getElementById("statusLog").innerText = "Error: " + (err.reason || err.message);
            }
        }
    </script>
</body>
</html>\`;

fs.writeFileSync('index.html', htmlContent);
console.log("✅ index.html generated successfully!");

http.createServer((req, res) => {
    fs.readFile('index.html', (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end("index.html not found");
            return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
    });
}).listen(8080, () => console.log("🚀 Server active at http://localhost:8080/"));
