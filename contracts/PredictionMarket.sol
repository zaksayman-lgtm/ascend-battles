// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PredictionMarket {
    address public owner;

    struct Arena {
        string projectA;
        string projectB;
        uint256 poolA;
        uint256 poolB;
        bool active;
        uint8 winner; // 0: None, 1: ProjectA, 2: ProjectB
    }

    uint256 public arenaCount;
    mapping(uint256 => Arena) public arenas;
    mapping(uint256 => mapping(address => uint256)) public betsA;
    mapping(uint256 => mapping(address => uint256)) public betsB;

    event ArenaCreated(uint256 indexed arenaId, string projectA, string projectB);
    event PredictionPlaced(uint256 indexed arenaId, address indexed user, uint8 team, uint256 amount);
    event ArenaResolved(uint256 indexed arenaId, uint8 winner);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function createArena(string memory _projectA, string memory _projectB) external onlyOwner returns (uint256) {
        arenaCount++;
        arenas[arenaCount] = Arena({
            projectA: _projectA,
            projectB: _projectB,
            poolA: 0,
            poolB: 0,
            active: true,
            winner: 0
        });

        emit ArenaCreated(arenaCount, _projectA, _projectB);
        return arenaCount;
    }

    function predict(uint256 _arenaId, uint8 _team) external payable {
        Arena storage arena = arenas[_arenaId];
        require(arena.active, "Arena not active");
        require(_team == 1 || _team == 2, "Invalid team selection");
        require(msg.value > 0, "Prediction amount must be greater than 0");

        if (_team == 1) {
            betsA[_arenaId][msg.sender] += msg.value;
            arena.poolA += msg.value;
        } else {
            betsB[_arenaId][msg.sender] += msg.value;
            arena.poolB += msg.value;
        }

        emit PredictionPlaced(_arenaId, msg.sender, _team, msg.value);
    }

    function resolveArena(uint256 _arenaId, uint8 _winner) external onlyOwner {
        Arena storage arena = arenas[_arenaId];
        require(arena.active, "Arena already resolved");
        require(_winner == 1 || _winner == 2, "Invalid winner");

        arena.active = false;
        arena.winner = _winner;

        emit ArenaResolved(_arenaId, _winner);
    }
}
