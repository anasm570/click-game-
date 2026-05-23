const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// مجلد البيانات
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
const playersFile = path.join(dataDir, 'players.json');

function loadPlayers() {
    if (!fs.existsSync(playersFile)) return [];
    try {
        return JSON.parse(fs.readFileSync(playersFile));
    } catch (e) {
        return [];
    }
}

function savePlayers(players) {
    fs.writeFileSync(playersFile, JSON.stringify(players, null, 2));
}

app.use(express.json());
app.use(express.static(__dirname));

// جعل الملف index+.html هو الصفحة الرئيسية
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index+.html'));
});

// API: تسجيل أو تحديث لاعب
app.post('/api/player', (req, res) => {
    const { name, phone, score, upgrades, clicks } = req.body;
    if (!name || !phone) return res.status(400).json({ error: 'الاسم والرقم مطلوبان' });
    let players = loadPlayers();
    const existingIndex = players.findIndex(p => p.phone === phone);
    const playerData = {
        name,
        phone,
        score: score || 0,
        upgrades: upgrades || { clickPower: 1, autoClicker: 0 },
        clicks: clicks || 0,
        lastUpdate: new Date().toISOString()
    };
    if (existingIndex !== -1) {
        players[existingIndex] = { ...players[existingIndex], ...playerData };
    } else {
        players.push(playerData);
    }
    savePlayers(players);
    res.json({ success: true });
});

// API: جلب بيانات لاعب معين
app.get('/api/player/:phone', (req, res) => {
    const phone = req.params.phone;
    const players = loadPlayers();
    const player = players.find(p => p.phone === phone);
    if (player) {
        res.json({ success: true, player });
    } else {
        res.json({ success: false });
    }
});

// API: لوحة المتصدرين
app.get('/api/leaderboard', (req, res) => {
    const players = loadPlayers();
    const top = players.sort((a, b) => b.score - a.score).slice(0, 10);
    res.json(top);
});

app.listen(PORT, () => {
    console.log(`✅ لعبة النقر العالمية تعمل على المنفذ ${PORT}`);
});