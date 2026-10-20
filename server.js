const http = require('http');

const PORT = process.env.PORT || 3001;
const ELYSIUM_TOKENS_URL = 'https://elysiumeco.xyz/api/tokens';

async function getLiveAscendTokens() {
  try {
    const res = await fetch(ELYSIUM_TOKENS_URL);
    if (!res.ok) throw new Error('Failed to fetch tokens');
    const tokens = await res.json();

    const dynamicArenas = [];
    for (let i = 0; i < tokens.length - 1; i += 2) {
      dynamicArenas.push({
        id: Math.floor(i / 2) + 1,
        category: "ASCEND TOKEN BATTLE",
        timer: "Live Battle",
        competitorA: {
          code: tokens[i].symbol || tokens[i].code,
          name: tokens[i].name,
          address: tokens[i].address
        },
        competitorB: {
          code: tokens[i + 1].symbol || tokens[i + 1].code,
          name: tokens[i + 1].name,
          address: tokens[i + 1].address
        },
        sponsorPool: "$1,000 USDC",
        predictors: Math.floor(Math.random() * 200) + 50
      });
    }
    return dynamicArenas;
  } catch (error) {
    console.error("Error fetching live tokens, falling back to cached array:", error);
    return [];
  }
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url === '/api/arenas' && req.method === 'GET') {
    const liveArenas = await getLiveAscendTokens();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(liveArenas));
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
  }
});

server.listen(PORT, () => {
  console.log(`Ascend Battles live engine running on port ${PORT}`);
});
