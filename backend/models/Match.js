// filepath: backend/models/Match.js
const mongoose = require('mongoose');

// Flexible schema to accommodate Cricsheet JSON structure
const MatchSchema = new mongoose.Schema({
  meta: Object,
  info: {
    dates: [String],
    gender: String,
    match_type: String,
    outcome: Object,
    overs: Number,
    player_of_match: [String],
    players: Object,
    teams: [String],
    toss: Object,
    venue: String,
    event: Object
  },
  innings: [
    {
      team: String,
      overs: [
        {
          over: Number,
          deliveries: [
            {
              batter: String,
              bowler: String,
              non_striker: String,
              runs: {
                batter: Number,
                extras: Number,
                total: Number
              },
              wickets: Array,
              extras: Object,
              review: Object
            }
          ]
        }
      ],
      powerplays: Array,
      target: Object
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Match', MatchSchema);