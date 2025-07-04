import { connectToDB } from '../../lib/db.js';
import { updateMatch } from '../../lib/controllers/matchController.js';

export default async function handler(req, res) {
  await connectToDB();

  if (req.method === 'PUT') {
    req.params = { matchId: req.query.matchId };
    return updateMatch(req, res);
  }

  return res.status(405).end();
}
