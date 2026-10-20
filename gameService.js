import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, HYPEREVM_RPC } from './web3config.js';
import abi from './abi.json';

export class AscendBattlesService {
    constructor(signerOrProvider) {
        this.provider = signerOrProvider || new ethers.providers.StaticJsonRpcProvider(HYPEREVM_RPC);
        this.contract = new ethers.Contract(CONTRACT_ADDRESS, abi, this.provider);
    }

    async getRoundDetails(roundId) {
        return await this.contract.rounds(roundId);
    }

    async predict(roundId, predictedOutcome, amountInWei, signer) {
        const contractWithSigner = this.contract.connect(signer);
        const tx = await contractWithSigner.predict(roundId, predictedOutcome, { value: amountInWei });
        return await tx.wait();
    }

    async fundRoundUsdcPool(roundId, usdcAmountWei, signer) {
        const contractWithSigner = this.contract.connect(signer);
        const tx = await contractWithSigner.fundRoundUsdcPool(roundId, usdcAmountWei);
        return await tx.wait();
    }

    async claimReward(roundId, signer) {
        const contractWithSigner = this.contract.connect(signer);
        const tx = await contractWithSigner.claim(roundId);
        return await tx.wait();
    }
}

export function calculateLiveOdds(totalNativePool, outcomePool, userStakeAmount) {
    if (!outcomePool || outcomePool.eq(0)) {
        return { multiplier: "1.00x", estimatedPayout: "0" };
    }

    const totalPoolNum = parseFloat(ethers.utils.formatEther(totalNativePool));
    const outcomePoolNum = parseFloat(ethers.utils.formatEther(outcomePool));
    const userStakeNum = parseFloat(userStakeAmount || "0");

    const newTotalPool = totalPoolNum + userStakeNum;
    const newOutcomePool = outcomePoolNum + userStakeNum;

    const multiplier = newTotalPool / newOutcomePool;
    const estimatedPayout = userStakeNum * multiplier;

    return {
        multiplier: multiplier.toFixed(2) + "x",
        estimatedPayout: estimatedPayout.toFixed(4)
    };
}
