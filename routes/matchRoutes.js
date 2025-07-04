const express = require('express');
const router = express.Router();

const {
  getUpcomingMatches,
  addMatch,
  updateMatch
} = require('../controller/MatchController');

// Match-related endpoints
router.get('/', getUpcomingMatches); 
router.post('/', addMatch);
router.put('/:matchId', updateMatch);

module.exports = router;