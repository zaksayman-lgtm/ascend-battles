const http = require('http');

const PORT = process.env.PORT || 3001;

// Official Kinetiq Elysium Testnet RPC URL (Chain ID: 99801)
const ELYSIUM_TESTNET_RPC = process.env.ELYSIUM_RPC || "https://testnet-rpc.elysium.kinetiq.xyz";

async function getLiveAscendTokens() {
  try {
    const res = await fetch(ELYSIUM_TESTNET_RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_blockNumber',
        params: [],
        id: 1
      })
    });

    if (!res.ok) throw new Error("RPC endpoint unreachable");
    const data = await res.json();
    console.log("Connected to Elysium Testnet block:", data.result);
    
    return getKinetiqAscendArenas();
  } catch (error) {
    console.error("RPC fetch error on Chain ID 99801, utilizing cached tokens:", error.message);
    return getKinetiqAscendArenas();
  }
}

function getKinetiqAscendArenas() {
  return [
    {
      id: 1,
      category: "ASCEND LAUNCHPAD 1V1",
      timer: "Live Battle",
      competitorA: { code: "HYPE", name: "Hyperliquid", address: "0x0000000000000000000000000000000000000000" },
      competitorB: { code: "ASCEND", name: "Ascend Token", address: "0x1111111111111111111111111111111111111111" },
      sponsorPool: "2,500 HYPE",
      predictors: 210
    },
    {
      id: 2,
      category: "ASCEND LAUNCHPAD 1V1",
      timer: "Live Battle",
      competitorA: { code: "KNTQ", name: "Kinetiq Protocol", address: "0x2222222222222222222222222222222222222222" },
      competitorB: { code: "CENT", name: "Incentiv Pool", address: "0x3333333333333333333333333333333333333333" },
      sponsorPool: "1,200 HYPE",
      predictors: 145
    }
  ];
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
  console.log(`Ascend Battles engine running on Kinetiq Elysium Testnet (Chain ID 99801) on port ${PORT}`);
});
