import { connectToDB } from '../../lib/db.js';
import {
  getUpcomingMatches,
  addMatch
} from '../../lib/controllers/matchController.js';

export default async function handler(req, res) {
  try {
    await connectToDB();

    if (req.method === 'GET') {
      return getUpcomingMatches(req, res);
    }

    if (req.method === 'POST') {
      return addMatch(req, res);
    }

    return res.status(405).json({ message: 'Method Not Allowed' });

  } catch (error) {
    console.error('❌ API Route Error:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}
