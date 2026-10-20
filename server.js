const http = require('http');

const PORT = process.env.PORT || 3001;

// Live Ascend Launchpad tokens on Elysium
let ascendTokens = [
    { id: '1', name: 'Frog Flip', symbol: 'FROG', address: '0x111...', volume24h: 12450, marketCap: 45000 },
    { id: '2', name: 'Elysium Doge', symbol: 'EDOGE', address: '0x222...', volume24h: 8900, marketCap: 32000 },
    { id: '3', name: 'Hyper Cat', symbol: 'HCAT', address: '0x333...', volume24h: 15200, marketCap: 68000 },
    { id: '4', name: 'Ascend Ape', symbol: 'AAPE', address: '0x444...', volume24h: 6300, marketCap: 21000 }
];

// Helper to generate dynamic 1v1 arenas from active Ascend tokens
function generateArenas() {
    const arenas = [];
    for (let i = 0; i < ascendTokens.length - 1; i += 2) {
        const tokenA = ascendTokens[i];
        const tokenB = ascendTokens[i + 1];

        const totalVol = (tokenA.volume24h || 1) + (tokenB.volume24h || 1);
        const oddsA = (1 + (tokenB.volume24h / totalVol)).toFixed(2);
        const oddsB = (1 + (tokenA.volume24h / totalVol)).toFixed(2);

        arenas.push({
            id: `arena-${i}`,
            category: "ASCEND 1v1 MATCHUP",
            timer: "Closes in 06h 00m",
            tokenA: {
                name: tokenA.name,
                code: tokenA.symbol,
                volume: `$${tokenA.volume24h.toLocaleString()}`,
                odds: oddsA
            },
            tokenB: {
                name: tokenB.name,
                code: tokenB.symbol,
                volume: `$${tokenB.volume24h.toLocaleString()}`,
                odds: oddsB
            },
            pool: `$${(tokenA.volume24h + tokenB.volume24h).toLocaleString()} USDC`,
            predictors: 240 + (i * 50)
        });
    }
    return arenas;
}

const server = http.createServer((req, res) => {
    // Enable CORS for frontend requests
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.url === '/api/arenas' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(generateArenas()));
        return;
    }

    if (req.url === '/api/tokens/register' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                if (data.name && data.symbol) {
                    const newToken = {
                        id: String(ascendTokens.length + 1),
                        name: data.name,
                        symbol: data.symbol,
                        address: data.address || '0x...',
                        volume24h: data.volume24h || 5000,
                        marketCap: data.marketCap || 10000
                    };
                    ascendTokens.push(newToken);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, token: newToken }));
                } else {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Name and symbol required' }));
                }
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
        });
        return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Endpoint not found' }));
});

server.listen(PORT, () => {
    console.log(`Ascend Battles server running on port ${PORT}`);
});
