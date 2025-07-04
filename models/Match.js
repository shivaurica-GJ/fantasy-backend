const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  title: String,
  time: String,
  schedule: String,
  team1: String,
  team2: String,
  team1Desc: String,
  team2Desc: String,
  prize: String,
  players: Array,
  team1Flag: String,
  team2Flag: String,
  category: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Match', matchSchema);  // Changed to CommonJS export