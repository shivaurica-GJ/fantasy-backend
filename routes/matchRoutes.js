const express = require('express');
const router = express.Router();
const {
  getUpcomingMatches,
  addMatch,
  updateMatch
} = require('../lib/controllers/matchController');


// Match-related endpoints
router.get('/', getUpcomingMatches); 
router.post('/', addMatch);
router.put('/:matchId', updateMatch);

module.exports = router; 