const fs = require('fs');
const solc = require('solc');

console.log("Extracting updated ABI...");
const source = fs.readFileSync('contracts/AscendBattlesV2.sol', 'utf8');
const input = {
    language: 'Solidity',
    sources: { 'AscendBattlesV2.sol': { content: source } },
    settings: { outputSelection: { '*': { '*': ['abi'] } } }
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));
const abi = output.contracts['AscendBattlesV2.sol']['AscendBattlesV2'].abi;

fs.writeFileSync('abi.json', JSON.stringify(abi, null, 2));
console.log("Success: abi.json updated!");
