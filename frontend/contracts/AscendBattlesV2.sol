// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AscendBattlesV2
 * @dev Gamified Web3 Prediction Arena with Daily XP, Dynamic Odds 1v1 Battles, 
 *      and Net Profit Player Rankings on HyperEVM.
 */
contract AscendBattlesV2 {
    address public owner;

    struct Project {
        uint256 id;
        address tokenAddress;
        string name;
        string symbol;
        uint256 totalGlobalXP;
        bool active;
    }

    struct Battle {
        uint256 id;
        uint256 projectAId;
        uint256 projectBId;
        uint256 totalPoolA;
        uint256 totalPoolB;
        uint256 startTime;
        uint256 endTime;
        bool resolved;
        uint256 winningProject; // 0 = draw/unresolved, projectAId or projectBId
    }

    // State Variables
    uint256 public projectCount;
    uint256 public battleCount;
    uint256 public constant DAILY_XP_AMOUNT = 100;
    uint256 public constant CLAIM_COOLDOWN = 1 days;

    // Mappings
    mapping(uint256 => Project) public projects;
    mapping(uint256 => Battle) public battles;

    mapping(address => uint256) public userXP;
    mapping(address => uint256) public lastClaimTimestamp;
    mapping(address => int256) public playerNetProfit;

    // battleId => userAddress => projectId => xpStaked
    mapping(uint256 => mapping(address => mapping(uint256 => uint256))) public battleStakes;
    // battleId => userAddress => hasClaimed
    mapping(uint256 => mapping(address => bool)) public hasClaimed;

    // Events
    event ProjectRegistered(uint256 indexed id, string name, string symbol, address tokenAddress);
    event DailyXPClaimed(address indexed user, uint256 amount, uint256 timestamp);
    event BattleCreated(uint256 indexed battleId, uint256 projectAId, uint256 projectBId, uint256 endTime);
    event XPStaked(uint256 indexed battleId, address indexed user, uint256 indexed projectId, uint256 amount);
    event BattleResolved(uint256 indexed battleId, uint256 winningProjectId, uint256 totalPool);
    event RewardClaimed(uint256 indexed battleId, address indexed user, uint256 payout, int256 netProfitGained);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only contract owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // ------------------------------------------------------------------------
    // 1. PROJECT REGISTRATION
    // ------------------------------------------------------------------------
    function registerProject(address _tokenAddress, string memory _name, string memory _symbol) external returns (uint256) {
        require(_tokenAddress != address(0), "Invalid token address");
        projectCount++;
        projects[projectCount] = Project(projectCount, _tokenAddress, _name, _symbol, 0, true);
        
        emit ProjectRegistered(projectCount, _name, _symbol, _tokenAddress);
        return projectCount;
    }

    // ------------------------------------------------------------------------
    // 2. DAILY XP CLAIM SYSTEM
    // ------------------------------------------------------------------------
    function claimDailyXP() external {
        require(block.timestamp >= lastClaimTimestamp[msg.sender] + CLAIM_COOLDOWN, "XP claim on 24h cooldown");
        lastClaimTimestamp[msg.sender] = block.timestamp;
        userXP[msg.sender] += DAILY_XP_AMOUNT;

        emit DailyXPClaimed(msg.sender, DAILY_XP_AMOUNT, block.timestamp);
    }

    function canClaimXP(address _user) external view returns (bool) {
        return block.timestamp >= lastClaimTimestamp[_user] + CLAIM_COOLDOWN;
    }

    // ------------------------------------------------------------------------
    // 3. 1v1 ARENA BATTLES & DYNAMIC ODDS
    // ------------------------------------------------------------------------
    function createBattle(uint256 _projectAId, uint256 _projectBId, uint256 _durationInSeconds) external onlyOwner returns (uint256) {
        require(_projectAId > 0 && _projectAId <= projectCount, "Invalid Project A");
        require(_projectBId > 0 && _projectBId <= projectCount, "Invalid Project B");
        require(_projectAId != _projectBId, "Projects must be distinct");

        battleCount++;
        battles[battleCount] = Battle(
            battleCount,
            _projectAId,
            _projectBId,
            0,
            0,
            block.timestamp,
            block.timestamp + _durationInSeconds,
            false,
            0
        );

        emit BattleCreated(battleCount, _projectAId, _projectBId, block.timestamp + _durationInSeconds);
        return battleCount;
    }

    function placeXPBet(uint256 _battleId, uint256 _projectId, uint256 _xpAmount) external {
        Battle storage b = battles[_battleId];
        require(block.timestamp < b.endTime, "Battle has ended");
        require(!b.resolved, "Battle is resolved");
        require(_projectId == b.projectAId || _projectId == b.projectBId, "Project not in this battle");
        require(userXP[msg.sender] >= _xpAmount, "Insufficient XP balance");
        require(_xpAmount > 0, "Must stake > 0 XP");

        userXP[msg.sender] -= _xpAmount;
        battleStakes[_battleId][msg.sender][_projectId] += _xpAmount;

        if (_projectId == b.projectAId) {
            b.totalPoolA += _xpAmount;
        } else {
            b.totalPoolB += _xpAmount;
        }

        projects[_projectId].totalGlobalXP += _xpAmount;

        emit XPStaked(_battleId, msg.sender, _projectId, _xpAmount);
    }

    function resolveBattle(uint256 _battleId) external {
        Battle storage b = battles[_battleId];
        require(block.timestamp >= b.endTime, "Battle ongoing");
        require(!b.resolved, "Already resolved");

        b.resolved = true;

        if (b.totalPoolA > b.totalPoolB) {
            b.winningProject = b.projectAId;
        } else if (b.totalPoolB > b.totalPoolA) {
            b.winningProject = b.projectBId;
        } else {
            b.winningProject = 0; // Draw
        }

        emit BattleResolved(_battleId, b.winningProject, b.totalPoolA + b.totalPoolB);
    }

    // ------------------------------------------------------------------------
    // 4. PAYOUTS & PLAYER NET PROFIT LEADERBOARD
    // ------------------------------------------------------------------------
    function claimBattleReward(uint256 _battleId) external {
        Battle storage b = battles[_battleId];
        require(b.resolved, "Battle not resolved yet");
        require(!hasClaimed[_battleId][msg.sender], "Reward already claimed");

        uint256 winningId = b.winningProject;
        uint256 userStake = battleStakes[_battleId][msg.sender][winningId];
        require(userStake > 0, "No winning stake in this battle");

        hasClaimed[_battleId][msg.sender] = true;

        uint256 totalWinningPool = (winningId == b.projectAId) ? b.totalPoolA : b.totalPoolB;
        uint256 totalBattlePool = b.totalPoolA + b.totalPoolB;

        // Parimutuel Payout Calculation
        uint256 payout = (userStake * totalBattlePool) / totalWinningPool;

        userXP[msg.sender] += payout;

        int256 netProfit = int256(payout) - int256(userStake);
        playerNetProfit[msg.sender] += netProfit;

        emit RewardClaimed(_battleId, msg.sender, payout, netProfit);
    }

    // ------------------------------------------------------------------------
    // VIEW HELPERS
    // ------------------------------------------------------------------------
    function getBattleOdds(uint256 _battleId) external view returns (uint256 oddsA_Bps, uint256 oddsB_Bps) {
        Battle storage b = battles[_battleId];
        uint256 total = b.totalPoolA + b.totalPoolB;
        if (total == 0) return (20000, 20000); // 2.0x default (in basis points, 10000 = 1.0x)

        uint256 bpsA = b.totalPoolA > 0 ? (total * 10000) / b.totalPoolA : 20000;
        uint256 bpsB = b.totalPoolB > 0 ? (total * 10000) / b.totalPoolB : 20000;

        return (bpsA, bpsB);
    }
}
