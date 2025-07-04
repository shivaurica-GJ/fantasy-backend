const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  title: { type: String, required: true },
  time: { type: String, required: true },
  team1: { type: String, required: true },
  team2: { type: String, required: true },
  team1Flag: { type: String, required: true },
  team2Flag: { type: String, required: true },
  category: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Match', matchSchema);