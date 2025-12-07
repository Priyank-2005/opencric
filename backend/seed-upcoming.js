// filepath: backend/seed-upcoming.js
const mongoose = require('mongoose');
const Match = require('./models/Match');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/opencric';

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Inserting upcoming matches...');
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);

    const fixtures = [
      {
        info: {
          dates: [tomorrow.toISOString().split('T')[0]],
          teams: ["India", "Pakistan"],
          venue: "Eden Gardens, Kolkata",
          match_type: "ODI",
          event: { name: "Asia Cup 2026" },
          outcome: {} // No winner yet
        },
        innings: [] // Empty innings
      },
      {
        info: {
          dates: [tomorrow.toISOString().split('T')[0]],
          teams: ["Australia", "England"],
          venue: "MCG, Melbourne",
          match_type: "Test",
          event: { name: "The Ashes" },
          outcome: {}
        },
        innings: []
      },
      {
        info: {
          dates: [dayAfter.toISOString().split('T')[0]],
          teams: ["South Africa", "New Zealand"],
          venue: "Wanderers, Johannesburg",
          match_type: "T20",
          event: { name: "Bilateral Series" },
          outcome: {}
        },
        innings: []
      }
    ];

    await Match.insertMany(fixtures);
    console.log('Added 3 upcoming matches!');
    process.exit();
  })
  .catch(err => console.error(err));