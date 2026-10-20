// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AscendBattles {
    struct Project {
        uint256 id;
        address tokenAddress;
        string name;
        string symbol;
        uint256 totalVotes;
        bool active;
    }

    address public owner;
    uint256 public projectCount;
    
    mapping(uint256 => Project) public projects;
    mapping(uint256 => mapping(address => uint256)) public userVotesPerProject;

    event ProjectRegistered(uint256 indexed id, address indexed tokenAddress, string name, string symbol);
    event Voted(uint256 indexed projectId, address indexed voter, uint256 votes);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can execute");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function registerProject(address _tokenAddress, string memory _name, string memory _symbol) external returns (uint256) {
        require(_tokenAddress != address(0), "Invalid token address");
        
        projectCount++;
        projects[projectCount] = Project({
            id: projectCount,
            tokenAddress: _tokenAddress,
            name: _name,
            symbol: _symbol,
            totalVotes: 0,
            active: true
        });

        emit ProjectRegistered(projectCount, _tokenAddress, _name, _symbol);
        return projectCount;
    }

    function voteForProject(uint256 _projectId, uint256 _votes) external {
        require(_projectId > 0 && _projectId <= projectCount, "Project does not exist");
        require(projects[_projectId].active, "Project battle is inactive");
        require(_votes > 0, "Votes must be greater than 0");

        projects[_projectId].totalVotes += _votes;
        userVotesPerProject[_projectId][msg.sender] += _votes;

        emit Voted(_projectId, msg.sender, _votes);
    }

    function getProject(uint256 _projectId) external view returns (
        uint256 id,
        address tokenAddress,
        string memory name,
        string memory symbol,
        uint256 totalVotes,
        bool active
    ) {
        Project memory p = projects[_projectId];
        return (p.id, p.tokenAddress, p.name, p.symbol, p.totalVotes, p.active);
    }
}
