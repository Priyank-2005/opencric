const mongoose = require('mongoose');

const PlayerRankingSchema = new mongoose.Schema({
  rank: Number,
  name: String,
  team: String,
  rating: Number
});

const RankingSchema = new mongoose.Schema({
  category: { type: String, unique: true }, // e.g., "men_batting", "men_bowling", "women_batting"
  players: [PlayerRankingSchema],
  lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Ranking', RankingSchema);