const Match = require('../models/Match');

// GET all matches
const getUpcomingMatches = async (req, res) => {
  try {
    const matches = await Match.find({ isActive: true })
      .sort({ createdAt: -1 })
      .maxTimeMS(30000);

    if (!matches || matches.length === 0) {
      return res.status(200).json([]);
    }

    const updatedMatches = matches.map((match) => {
      const fixFlagUrl = (url) =>
        url?.includes("localhost:5000")
          ? url.replace("http://localhost:5000", "https://fantasy-backend-seven.vercel.app")
          : url;

      return {
        ...match._doc,
        team1Flag: fixFlagUrl(match.team1Flag),
        team2Flag: fixFlagUrl(match.team2Flag),
        teamAFlag: fixFlagUrl(match.teamAFlag),
        teamBFlag: fixFlagUrl(match.teamBFlag),
      };
    });

    res.status(200).json(updatedMatches);
  } catch (error) {
    console.error("Error fetching matches:", error.message);
    res.status(500).json({ error: "Failed to fetch matches" });
  }
};


// POST add new match
const addMatch = async (req, res) => {
  const {
    title,
    time,
    schedule,
    team1,
    team2,
    team1Desc,
    team2Desc,
    prize,
    players,
    team1Flag,
    team2Flag,
    category
  } = req.body;

  if (!title || !time || !schedule || !team1 || !team2 || !team1Flag || !team2Flag || !category) {
    return res.status(400).json({ error: "Required fields missing" });
  }

  try {
    const newMatch = new Match({
      title,
      time,
      schedule,
      team1,
      team2,
      team1Desc,
      team2Desc,
      prize,
      players,
      team1Flag,
      team2Flag,
      category
    });

    const saved = await newMatch.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ error: "Failed to save match", details: error.message });
  }
};

// PUT update by Mongo _id
const updateMatch = async (req, res) => {
  const { matchId } = req.params;

  try {
    const updated = await Match.findByIdAndUpdate(matchId, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ error: "Match not found" });
    }
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: "Update failed", details: error.message });
  }
};

module.exports = {
  getUpcomingMatches,
  addMatch,
  updateMatch
};