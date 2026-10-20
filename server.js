const http = require('http');

const PORT = process.env.PORT || 3001;

const arenas = [
    {
        id: 1,
        category: "GAMEFI vs GAMEFI",
        timer: "Closes in 04h 22m",
        competitorA: { code: "CS", name: "Cyber Samurai", odds: 1.85 },
        competitorB: { code: "MR", name: "Mecha Ronin", odds: 2.15 },
        sponsorPool: "$50.00 USDC",
        predictors: 142
    },
    {
        id: 2,
        category: "DEFI vs DEFI",
        timer: "Closes in 18h 05m",
        competitorA: { code: "NY", name: "Nexus Yield", odds: 1.75 },
        competitorB: { code: "AL", name: "Apex Liquidity", odds: 2.40 },
        sponsorPool: "$100.00 USDC",
        predictors: 310
    }
];

const server = http.createServer((req, res) => {
    // Enable CORS for frontend requests
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.url === '/api/arenas') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(arenas));
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: "Not Found" }));
    }
});

server.listen(PORT, () => {
    console.log(`Ascend Battles API running on port ${PORT}`);
});
