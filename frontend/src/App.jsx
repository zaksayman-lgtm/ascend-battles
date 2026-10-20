import { useState } from 'react';
import { ethers } from 'ethers';

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "0x8B8e13c72AF17A67507FE6242071b1EddfeD14A3";
const EXPLORER_URL = "https://explore-testnet.hyperpc.app";

const CONTRACT_ABI = [
  "function registerProject(address _tokenAddress, string _name, string _symbol) external returns (uint256)",
  "function voteForProject(uint256 _projectId, uint256 _votes) external",
  "function getProject(uint256 _projectId) external view returns (uint256 id, address tokenAddress, string name, string symbol, uint256 totalVotes, bool active)",
  "function projectCount() external view returns (uint256)"
];

export default function App() {
  const [account, setAccount] = useState("");
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(1);
  const [votesInput, setVotesInput] = useState("100");
  const [status, setStatus] = useState("");
  const [txHash, setTxHash] = useState("");
  const [loading, setLoading] = useState(false);

  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [regName, setRegName] = useState("");
  const [regSymbol, setRegSymbol] = useState("");
  const [regTokenAddress, setRegTokenAddress] = useState("");

  const fetchAllProjects = async (providerOrSigner) => {
    try {
      setLoading(true);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, providerOrSigner);
      const count = await contract.projectCount();
      const total = Number(count);
      const items = [];

      for (let i = 1; i <= total; i++) {
        const data = await contract.getProject(i);
        items.push({
          id: data[0].toString(),
          tokenAddress: data[1],
          name: data[2],
          symbol: data[3],
          totalVotes: BigInt(data[4].toString()),
          active: data[5]
        });
      }

      items.sort((a, b) => (b.totalVotes > a.totalVotes ? 1 : -1));
      setProjects(items);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setStatus("Failed to load project leaderboard.");
      setLoading(false);
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please open this app in MetaMask browser or an EVM-compatible wallet!");
      return;
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);
      fetchAllProjects(provider);
    } catch (err) {
      console.error(err);
      setStatus("Wallet connection failed.");
    }
  };

  const submitVote = async () => {
    if (!window.ethereum || !account) {
      alert("Connect wallet first!");
      return;
    }
    try {
      setStatus("Awaiting wallet approval...");
      setTxHash("");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.voteForProject(selectedProjectId, votesInput);
      setTxHash(tx.hash);
      setStatus(`Transaction submitted!`);
      await tx.wait();
      setStatus("Vote successfully recorded on HyperEVM!");
      fetchAllProjects(provider);
    } catch (err) {
      console.error(err);
      setStatus("Transaction failed or rejected.");
    }
  };

  const handleRegisterProject = async (e) => {
    e.preventDefault();
    if (!window.ethereum || !account) {
      alert("Connect wallet first!");
      return;
    }
    if (!regName || !regSymbol || !regTokenAddress) {
      alert("Please fill in all project fields.");
      return;
    }
    try {
      setStatus("Awaiting registration approval in wallet...");
      setTxHash("");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.registerProject(regTokenAddress, regName, regSymbol);
      setTxHash(tx.hash);
      setStatus(`Registration submitted!`);
      await tx.wait();
      setStatus(`Project "${regName}" successfully registered on-chain!`);

      setRegName("");
      setRegSymbol("");
      setRegTokenAddress("");
      setShowRegisterForm(false);
      fetchAllProjects(provider);
    } catch (err) {
      console.error(err);
      setStatus("Registration transaction failed or rejected.");
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '480px', margin: 'auto', color: '#fff', backgroundColor: '#121212', minHeight: '100vh' }}>
      <h2 style={{ textAlign: 'center', color: '#00e676' }}>⚡ Ascend Battles</h2>
      
      {!account ? (
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <button onClick={connectWallet} style={{ padding: '12px 24px', fontSize: '16px', fontWeight: 'bold', backgroundColor: '#00e676', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#000' }}>
            Connect Wallet
          </button>
        </div>
      ) : (
        <div>
          <p style={{ fontSize: '13px', color: '#aaa', textAlign: 'center' }}>
            <strong>Connected Wallet:</strong> <a href={`${EXPLORER_URL}/address/${account}`} target="_blank" rel="noreferrer" style={{ color: '#00e676' }}>{account.slice(0, 6)}...{account.slice(-4)}</a>
          </p>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '25px', borderBottom: '1px solid #333', paddingBottom: '8px' }}>
            <h3 style={{ margin: 0 }}>Leaderboard</h3>
            <button 
              onClick={() => setShowRegisterForm(!showRegisterForm)} 
              style={{ padding: '6px 12px', fontSize: '12px', fontWeight: 'bold', backgroundColor: '#333', border: '1px solid #00e676', borderRadius: '6px', color: '#00e676', cursor: 'pointer' }}
            >
              {showRegisterForm ? "Close Form" : "+ Register Project"}
            </button>
          </div>

          {showRegisterForm && (
            <form onSubmit={handleRegisterProject} style={{ border: '1px solid #333', padding: '15px', borderRadius: '8px', marginTop: '15px', backgroundColor: '#1a1a1a' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#00e676' }}>Register New Project</h4>
              <input
                type="text"
                placeholder="Project Name (e.g. Apex Protocol)"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                style={{ padding: '8px', width: '100%', marginBottom: '8px', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#222', color: '#fff', boxSizing: 'border-box' }}
              />
              <input
                type="text"
                placeholder="Token Symbol (e.g. APEX)"
                value={regSymbol}
                onChange={(e) => setRegSymbol(e.target.value)}
                style={{ padding: '8px', width: '100%', marginBottom: '8px', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#222', color: '#fff', boxSizing: 'border-box' }}
              />
              <input
                type="text"
                placeholder="Token Address (0x...)"
                value={regTokenAddress}
                onChange={(e) => setRegTokenAddress(e.target.value)}
                style={{ padding: '8px', width: '100%', marginBottom: '12px', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#222', color: '#fff', boxSizing: 'border-box' }}
              />
              <button type="submit" style={{ padding: '10px', width: '100%', fontWeight: 'bold', backgroundColor: '#00e676', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#000' }}>
                Submit Registration On-Chain
              </button>
            </form>
          )}

          {loading ? (
            <p>Loading projects from HyperEVM...</p>
          ) : (
            <div style={{ marginTop: '15px' }}>
              {projects.map((p, idx) => (
                <div 
                  key={p.id} 
                  onClick={() => setSelectedProjectId(Number(p.id))}
                  style={{ 
                    border: selectedProjectId === Number(p.id) ? '2px solid #00e676' : '1px solid #333', 
                    padding: '12px', 
                    borderRadius: '8px', 
                    marginBottom: '10px',
                    backgroundColor: selectedProjectId === Number(p.id) ? '#1e2a22' : '#1e1e1e',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold' }}>#{idx + 1} {p.name} ({p.symbol})</span>
                    <span style={{ color: '#00e676', fontWeight: 'bold' }}>{p.totalVotes.toString()} Votes</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#888', marginTop: '6px' }}>
                    Token: <a href={`${EXPLORER_URL}/address/${p.tokenAddress}`} target="_blank" rel="noreferrer" style={{ color: '#aaa', textDecoration: 'underline' }}>{p.tokenAddress.slice(0, 10)}...{p.tokenAddress.slice(-6)}</a>
                  </div>
                </div>
              ))}
            </div>
          )}

          <hr style={{ borderColor: '#333', margin: '20px 0' }} />

          <h3>Vote for Selected Project</h3>
          <p style={{ color: '#aaa', fontSize: '14px' }}>Selected Project ID: <strong>#{selectedProjectId}</strong></p>
          
          <input
            type="number"
            placeholder="Enter vote amount"
            value={votesInput}
            onChange={(e) => setVotesInput(e.target.value)}
            style={{ padding: '10px', width: '100%', marginBottom: '12px', borderRadius: '6px', border: '1px solid #444', backgroundColor: '#222', color: '#fff', boxSizing: 'border-box' }}
          />
          <button onClick={submitVote} style={{ padding: '12px', width: '100%', fontWeight: 'bold', backgroundColor: '#00e676', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#000' }}>
            Submit Vote
          </button>
        </div>
      )}

      {status && <p style={{ marginTop: '15px', color: '#00e676', textAlign: 'center', fontSize: '14px' }}>{status}</p>}
      {txHash && (
        <p style={{ textAlign: 'center', fontSize: '12px' }}>
          <a href={`${EXPLORER_URL}/tx/${txHash}`} target="_blank" rel="noreferrer" style={{ color: '#00e676', textDecoration: 'underline' }}>
            View Transaction on HyperEVM Explorer ↗
          </a>
        </p>
      )}
    </div>
  );
}
