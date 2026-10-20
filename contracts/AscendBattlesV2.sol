// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transfer(address recipient, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract AscendBattlesV2 {
    address public owner;
    IERC20 public usdcToken;

    struct Round {
        uint256 id;
        uint256 totalNativePool;
        uint256 totalUsdcRewardPool;
        uint256 winningOutcome;
        bool resolved;
        mapping(uint256 => uint256) outcomePools;
        mapping(address => mapping(uint256 => uint256)) userStakes;
        mapping(address => bool) claimed;
    }

    uint256 public currentRoundId;
    mapping(uint256 => Round) public rounds;

    event RoundCreated(uint256 indexed roundId);
    event PredictionPlaced(uint256 indexed roundId, address indexed player, uint256 outcome, uint256 amount);
    event UsdcPoolFunded(uint256 indexed roundId, uint256 amount);
    event RoundResolved(uint256 indexed roundId, uint256 winningOutcome);
    event RewardClaimed(uint256 indexed roundId, address indexed player, uint256 nativeAmount, uint256 usdcAmount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(address _usdcToken) {
        owner = msg.sender;
        usdcToken = IERC20(_usdcToken);
    }

    function startRound() external onlyOwner {
        currentRoundId++;
        Round storage r = rounds[currentRoundId];
        r.id = currentRoundId;
        emit RoundCreated(currentRoundId);
    }

    function fundRoundUsdcPool(uint256 roundId, uint256 usdcAmount) external onlyOwner {
        Round storage r = rounds[roundId];
        require(!r.resolved, "Round resolved");
        require(usdcAmount > 0, "Amount must be > 0");

        r.totalUsdcRewardPool += usdcAmount;
        require(usdcToken.transferFrom(msg.sender, address(this), usdcAmount), "USDC transfer failed");

        emit UsdcPoolFunded(roundId, usdcAmount);
    }

    function predict(uint256 roundId, uint256 outcome) external payable {
        Round storage r = rounds[roundId];
        require(!r.resolved, "Round resolved");
        require(msg.value > 0, "Stake must be > 0");

        r.totalNativePool += msg.value;
        r.outcomePools[outcome] += msg.value;
        r.userStakes[msg.sender][outcome] += msg.value;

        emit PredictionPlaced(roundId, msg.sender, outcome, msg.value);
    }

    function resolveRound(uint256 roundId, uint256 winningOutcome) external onlyOwner {
        Round storage r = rounds[roundId];
        require(!r.resolved, "Already resolved");

        r.winningOutcome = winningOutcome;
        r.resolved = true;

        emit RoundResolved(roundId, winningOutcome);
    }

    function claim(uint256 roundId) external {
        Round storage r = rounds[roundId];
        require(r.resolved, "Round not resolved");
        require(!r.claimed[msg.sender], "Already claimed");

        uint256 userWinningStake = r.userStakes[msg.sender][r.winningOutcome];
        uint256 totalWinningPool = r.outcomePools[r.winningOutcome];

        require(userWinningStake > 0, "No winning stake");
        r.claimed[msg.sender] = true;

        uint256 nativePayout = (userWinningStake * r.totalNativePool) / totalWinningPool;
        uint256 usdcPayout = totalWinningPool > 0 ? (userWinningStake * r.totalUsdcRewardPool) / totalWinningPool : 0;

        if (nativePayout > 0) {
            payable(msg.sender).transfer(nativePayout);
        }

        if (usdcPayout > 0) {
            require(usdcToken.transfer(msg.sender, usdcPayout), "USDC reward transfer failed");
        }

        emit RewardClaimed(roundId, msg.sender, nativePayout, usdcPayout);
    }
}
