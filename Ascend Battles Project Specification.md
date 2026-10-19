# Ascend Battles: Gamified 1v1 Launch Arena

> **Tagline:** The gamified prediction and hype arena driving daily on-chain engagement for projects launching on Ascend and the Elysium L2 ecosystem.

---

## 1. Project Overview

**Ascend Battles** is a Web3 community engagement platform built for the **Elysium L2 network** (powered by Hyperliquid infrastructure). While standard launchpads suffer from severe traffic drops between token sales, Ascend Battles keeps the community active daily by turning upcoming token launches into interactive, head-to-head prediction rounds.

Users connect their Web3 wallets to cast hype votes or stake testnet **$HYPE** tokens on upcoming projects. In return, active voters earn predictor XP, mint soulbound achievement badges, and gain guaranteed whitelist allocations for future launches on Ascend.

---

## 2. Strategic Ecosystem Fit

| Stakeholder | Strategic Value Delivered |
| :--- | :--- |
| **Elysium L2 Network** | Generates high-frequency, real-time EVM transactions on testnet/mainnet, proving network throughput and low-latency smart contract execution. |
| **Ascend Launchpad** | Transforms passive token launch observers into active daily users (DAU), building pre-launch liquidity and organic community awareness. |
| **Launching Projects** | Provides a structured 48-hour showcase to display tokenomics, pitch decks, and roadmaps directly to active Web3 traders and supporters. |
| **Community Members** | Rewards sharp market intuition with on-chain reputation, XP ranks, and priority launchpad access. |

---

## 3. Core Product Mechanics

### A. The 1v1 Battle Arena (48-Hour Rounds)
1. **Matchup Initialization:** Two projects preparing to launch on Ascend are paired in a featured 1v1 arena (e.g., *Project Alpha vs. Project Beta*).
2. **Participation Options:**
   * **Free Hype Vote:** Users cast 1 free daily vote for their favored project.
   * **Prediction Staking:** Users lock testnet `$HYPE` into a smart contract pool to back their prediction with on-chain conviction.
3. **Dynamic Hype Meter:** A real-time visual progress bar updates instantly as on-chain transactions are processed, showing the distribution of community support.
4. **Resolution:** At countdown zero, the smart contract locks submissions. The project with the highest cumulative Hype Score wins the battle round.

### B. Incentive & Reputation Engine
* **Predictor XP & Ranks:** Successful predictions distribute XP to participating wallets, moving users up the global leaderboard.
* **Soulbound Badges (SBTs):** Milestones trigger on-chain non-transferable badges (e.g., *"Elysium Pioneer"*, *"Top Predictor Q4"*).
* **Whitelist Allocation Perks:** Top 50 leaderboard accounts receive tier-boosted allocation rights for real token sales hosted on Ascend.

---

## 4. Technical Architecture

The application is lightweight, responsive, and mobile-native, enabling complete development and testing within Android (Termux) environments.

```
┌─────────────────────────────────────────────────────────┐
│                   React + Vite UI                       │
│      (Battle Arena, Live Hype Bars, Leaderboard)        │
└────────────────────────────┬────────────────────────────┘
                             │
                     ethers.js / viem
                             │
└────────────────────────────▼────────────────────────────┘
│                Elysium EVM Testnet                      │
│   (Chain ID: 998 / RPC: https://rpc.hyperliquid-testnet.xyz/evm)
└────────────────────────────┬────────────────────────────┘
                             │
└────────────────────────────▼────────────────────────────┘
│               AscendBattles.sol Contract                 │
│    (Handles 1v1 Arenas, On-Chain Votes, XP & SBTs)       │
└─────────────────────────────────────────────────────────┘
```

### System Components
* **Frontend Framework:** React + Vite + Tailwind CSS + Lucide Icons.
* **Smart Contracts:** Solidity `0.8.20` managed via Hardhat.
* **Web3 Integration:** `ethers.js` or `viem` connecting to browser/mobile wallets via JSON-RPC.
* **Network Target:** Elysium Testnet (Chain ID `998`, Gas Asset: `$HYPE`).

---

## 5. Hackathon Submission Deliverables (MVP Scope)

1. **Smart Contract (`AscendBattles.sol`):**
   * Create and manage battle rounds.
   * Record free votes and testnet `$HYPE` prediction stakes.
   * Calculate winning outcomes and track user XP scores on-chain.

2. **Web Interface (`/frontend`):**
   * **Battle Arena Tab:** Interactive split-card view displaying competing projects, live countdown timers, animated Hype Meters, and prediction buttons.
   * **Project Pitch Modal:** Expandable drawer displaying team background, tokenomics chart, and roadmap links.
   * **Leaderboard & Profile Tab:** Live display of top predictors, earned Soulbound Badges, and whitelist status.

3. **Demonstration Video (90 Seconds):**
   * Connect mobile wallet to Elysium Testnet.
   * Inspect competing projects in the Battle Arena.
   * Submit an on-chain prediction stake using testnet `$HYPE`.
   * Demonstrate real-time update of the visual Hype Meter and user leaderboard rank.

---

## 6. Long-Term Roadmap

* **Phase 1 (Hackathon MVP):** Testnet deployment, core 1v1 prediction mechanics, and React UI.
* **Phase 2 (Mainnet Launch):** Integration with Ascend token sale contracts for automatic whitelist distribution.
* **Phase 3 (Multi-Project Tournaments):** Bracket-style tournament pools for entire launch cohorts.
* **Phase 4 (SDK & Bot Integration):** Automated Telegram and Discord bots feeding live battle updates directly to community channels.