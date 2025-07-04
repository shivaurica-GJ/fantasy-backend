import { connectToDB } from '../../lib/db.js';
import { getUserProfile } from '../../lib/controllers/userController.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  await connectToDB();
  return getUserProfile(req, res);
}
