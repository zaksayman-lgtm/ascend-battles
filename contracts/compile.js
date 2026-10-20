import fs from 'fs';
import path from 'path';
import solc from 'solc';

let contractPath = path.resolve('AscendBattles.sol');
if (!fs.existsSync(contractPath)) {
  contractPath = path.resolve('contracts/AscendBattles.sol');
}

if (!fs.existsSync(contractPath)) {
  const source = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AscendBattles {
    mapping(address => uint256) public scores;

    event ScoreUpdated(address indexed player, uint256 newScore);

    function updateScore(uint256 _score) external {
        scores[msg.sender] = _score;
        emit ScoreUpdated(msg.sender, _score);
    }
}`;
  fs.writeFileSync('AscendBattles.sol', source);
  contractPath = 'AscendBattles.sol';
}

const sourceCode = fs.readFileSync(contractPath, 'utf8');

const input = {
  language: 'Solidity',
  sources: { 'AscendBattles.sol': { content: sourceCode } },
  settings: { outputSelection: { '*': { '*': ['abi', 'evm.bytecode'] } } }
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));

if (output.errors) {
  const errors = output.errors.filter(e => e.severity === 'error');
  if (errors.length > 0) {
    console.error('Compilation Errors:', errors);
    process.exit(1);
  }
}

const contract = output.contracts['AscendBattles.sol']['AscendBattles'];
fs.mkdirSync('./build', { recursive: true });
fs.writeFileSync('./build/AscendBattles.json', JSON.stringify(contract, null, 2));

console.log('Compiled 1 Solidity file successfully!');
