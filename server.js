const express = require("express");
const cors = require("cors");
const fs = require("fs");
const { ethers } = require("ethers");
const config = require("./config");

const app = express();
app.use(express.json());
app.use(cors());

const ARENAS_FILE = "./dynamic_arenas.json";

function loadArenas() {
    if (!fs.existsSync(ARENAS_FILE)) {
        return [
            { id: 2, projectA: "Project Gamma", projectB: "Project Delta", active: true }
        ];
    }
    try {
        return JSON.parse(fs.readFileSync(ARENAS_FILE, "utf8"));
    } catch (e) {
        return [];
    }
}

function saveArena(arena) {
    const arenas = loadArenas();
    if (!arenas.some(a => a.id === arena.id)) {
        arenas.push(arena);
        fs.writeFileSync(ARENAS_FILE, JSON.stringify(arenas, null, 2));
    }
}

app.get("/api/arenas", async (req, res) => {
    // Return dynamic automatically synced arenas
    res.json(loadArenas());
});

// Admin endpoint to automatically ingest incoming launched projects from Ascend
app.post("/api/arenas/sync", (req, res) => {
    const { id, projectA, projectB } = req.body;
    if (!id || !projectA || !projectB) {
        return res.status(400).json({ error: "Missing arena parameters" });
    }
    const newArena = { id: Number(id), projectA, projectB, active: true };
    saveArena(newArena);
    console.log(`Synced new arena #${id}: ${projectA} vs ${projectB}`);
    res.json({ success: true, arena: newArena });
});

const server = app.listen(3001, () => {
    console.log("Ascend Battles API running with Auto-Sync on port 3001...");
});

setInterval(() => {}, 10000);
