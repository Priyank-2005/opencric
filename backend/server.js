// filepath: backend/server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const Match = require('./models/Match');
const Ranking = require('./models/Ranking');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST"] } });

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/opencric')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));

// --- API ROUTES ---

// Matches
app.get('/api/matches', async (req, res) => {
  try { const matches = await Match.find().sort({ 'info.dates': -1 }).limit(50); res.json(matches); } 
  catch (err) { res.status(500).json({ error: err.message }); }
});
app.get('/api/matches/:id', async (req, res) => {
  try { const match = await Match.findById(req.params.id); if (!match) return res.status(404).json({ message: 'Match not found' }); res.json(match); } 
  catch (err) { res.status(500).json({ error: err.message }); }
});

// Search
app.get('/api/search', async (req, res) => {
  const query = req.query.q;
  if (!query) return res.json([]);
  try {
    const matches = await Match.find({
      $or: [
        { "info.teams": { $regex: query, $options: 'i' } },
        { "info.venue": { $regex: query, $options: 'i' } },
        { "info.event.name": { $regex: query, $options: 'i' } },
        { "info.match_type": { $regex: query, $options: 'i' } }
      ]
    }).sort({ 'info.dates': -1 }).limit(20);
    res.json(matches);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- REVERTED NEWS ENDPOINT (Mock Data) ---
app.get('/api/news', (req, res) => {
  res.json([
    { id: 1, title: "Hardik Pandya returns to Mumbai Indians as captain for IPL 2026", summary: "In a stunning trade window move, the all-rounder returns to his home franchise, taking over the reins from Rohit Sharma.", time: "1h ago", image: "https://placehold.co/600x400/004ba0/ffffff?text=Hardik+Returns", link: "#" },
    { id: 2, title: "Ashes 2025: England announce squad for Perth Test", summary: "Jofra Archer returns to the red-ball setup after a 2-year hiatus, while young spinner Rehan Ahmed gets the nod over Leach.", time: "3h ago", image: "https://placehold.co/600x400/ce1124/ffffff?text=Ashes+Squad", link: "#" },
    { id: 3, title: "Kohli's 51st ODI Century: A statistical deep dive", summary: "Breaking down the numbers behind the maestro's latest masterclass at the Wankhede. How does he compare to Sachin now?", time: "5h ago", image: "https://placehold.co/600x400/005b96/ffffff?text=Kohli+51", link: "#" },
    { id: 4, title: "WTC Points Table Update: South Africa climb to second spot", summary: "With a comprehensive innings victory over West Indies, the Proteas have strengthened their chances for the Lord's final.", time: "8h ago", image: "https://placehold.co/600x400/007749/ffffff?text=WTC+Table", link: "#" },
    { id: 5, title: "BCCI announces new central contracts: Rinku Singh promoted", summary: "The explosive finisher earns a Grade B contract following his consistent performances in the T20I format.", time: "12h ago", image: "https://placehold.co/600x400/1c1c1c/ffffff?text=BCCI+Contracts", link: "#" },
    { id: 6, title: "Women's Premier League: Auction purse remaining for all 5 teams", summary: "Gujarat Giants have the biggest purse heading into the mini-auction, while Mumbai Indians look for overseas pacers.", time: "1d ago", image: "https://placehold.co/600x400/ec008c/ffffff?text=WPL+Auction", link: "#" },
    { id: 7, title: "Injury Update: Maxwell ruled out of T20 series vs Pakistan", summary: "The Australian all-rounder suffered a hamstring strain during training and will fly home for rehabilitation.", time: "1d ago", image: "https://placehold.co/600x400/ffcd00/000000?text=Maxwell+Injured", link: "#" },
    { id: 8, title: "Ranji Trophy: Mumbai clinch 43rd title in thrilling final", summary: "A five-wicket haul from Tushar Deshpande helped Mumbai bowl out Vidarbha on the final day to lift the trophy.", time: "2d ago", image: "https://placehold.co/600x400/333333/ffffff?text=Ranji+Champs", link: "#" }
  ]);
});

app.get('/api/series', (req, res) => { res.json([ { id: 1, name: "India tour of Australia, 2025-26", dates: "Oct 19 - Jan 07" }, { id: 2, name: "The Ashes 2025-26", dates: "Nov 21 - Jan 05" }, { id: 3, name: "ICC Women's World Cup 2025", dates: "Oct 01 - Nov 02" }, { id: 4, name: "South Africa tour of India", dates: "Nov 10 - Dec 15" }, { id: 5, name: "Big Bash League 2025-26", dates: "Dec 12 - Feb 04" }, ]); });

// Rankings
app.get('/api/rankings', async (req, res) => {
  try {
    const allRankings = await Ranking.find({});
    const result = {};
    allRankings.forEach(r => { result[r.category] = r.players; });
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.post('/api/admin/rankings', async (req, res) => {
  const { category, players } = req.body;
  try {
    const updated = await Ranking.findOneAndUpdate({ category }, { players, lastUpdated: Date.now() }, { upsert: true, new: true });
    res.json({ success: true, data: updated });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Admin Routes
app.post('/api/admin/create-match', async (req, res) => { const { type, name, teams, matches } = req.body; try { const newMatches = matches.map(m => ({ info: { dates: [m.date], teams: m.teams || teams, venue: m.venue, match_type: m.format, event: { name: name, match_number: m.number }, outcome: {}, players: m.players || {} }, innings: [] })); await Match.insertMany(newMatches); res.json({ success: true, message: `${newMatches.length} matches created.` }); } catch (err) { res.status(500).json({ error: 'Failed' }); } });
app.post('/api/admin/toss', async (req, res) => { const { matchId, winner, decision } = req.body; try { const match = await Match.findById(matchId); if (!match) return res.status(404).json({ message: 'Not found' }); match.info.toss = { winner, decision }; if (!match.innings || match.innings.length === 0) { const battingTeam = decision === 'bat' ? winner : match.info.teams.find(t => t !== winner); match.innings = [{ team: battingTeam, overs: [], powerplays: [] }]; } await match.save(); io.emit(`match:${matchId}`, { type: 'score_update' }); res.json({ success: true }); } catch (err) { res.status(500).json({ error: err.message }); } });
app.post('/api/admin/change-innings', async (req, res) => { const { matchId } = req.body; try { const match = await Match.findById(matchId); if (!match) return res.status(404).json({ message: 'Not found' }); const currentBattingTeam = match.innings[match.innings.length - 1].team; const nextTeam = match.info.teams.find(t => t !== currentBattingTeam); match.innings.push({ team: nextTeam, overs: [], powerplays: [] }); await match.save(); io.emit(`match:${matchId}`, { type: 'score_update' }); res.json({ success: true }); } catch (err) { res.status(500).json({ error: err.message }); } });

// --- SCORE UPDATE (Fixed Overs Logic) ---
app.post('/api/admin/score', async (req, res) => {
  const { matchId, runs, isWicket, extraType, comment, batter, bowler } = req.body;
  
  try {
    const match = await Match.findById(matchId);
    if (!match) return res.status(404).json({ message: 'Not found' });

    const currentInnings = match.innings[match.innings.length - 1];
    
    // Construct delivery object
    const newDelivery = {
      runs: { 
        batter: runs, 
        extras: extraType ? 1 : 0, 
        total: runs + (extraType ? 1 : 0) 
      },
      batter: batter || "Striker",
      bowler: bowler || "Bowler",
      commentary: comment || `Runs: ${runs}`,
      wickets: isWicket ? [{ player_out: batter || "Batter", kind: "bowled" }] : [],
      extras: extraType ? { [extraType]: 1 } : {}
    };

    let targetOverIndex = currentInnings.overs.length - 1;
    let lastOver = currentInnings.overs[targetOverIndex];

    // OVERS LOGIC:
    // 1. Calculate valid balls in current over
    // 2. If >= 6 valid balls, start NEW over
    // Valid ball = NOT wide AND NOT noball
    
    let validBallsInOver = 0;
    if (lastOver) {
        lastOver.deliveries.forEach(d => {
            const isWide = d.extras && d.extras.wides;
            const isNoBall = d.extras && d.extras.noballs;
            // Also handle new "extraType" format if stored that way
            const isWideNew = d.runs.extras > 0 && d.commentary?.toLowerCase().includes('wide'); // simple check or use explicit field
            
            // If explicit extra type field exists use that, else fallback
            if (!isWide && !isNoBall && (!d.extras || Object.keys(d.extras).length === 0)) {
                validBallsInOver++;
            }
        });
    }

    // Is the CURRENT ball being added a legal delivery?
    const isCurrentBallLegal = extraType !== 'wide' && extraType !== 'noball';

    // Check if we need a new over BEFORE adding this ball
    // If the *previous* over is full (6 legal balls), we start a new one.
    if (!lastOver || (validBallsInOver >= 6)) {
       // Start new over
       lastOver = { over: currentInnings.overs.length, deliveries: [] };
       currentInnings.overs.push(lastOver);
    }
    
    lastOver.deliveries.push(newDelivery);

    await match.save();

    io.emit(`match:${matchId}`, { 
      type: 'score_update', 
      data: { lastBall: newDelivery }
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));