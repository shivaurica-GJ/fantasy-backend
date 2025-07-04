import { connectToDB } from '../../lib/db.js';
import { updateUserProfile } from '../../lib/controllers/userController.js';

export default async function handler(req, res) {
  if (req.method !== 'PUT') return res.status(405).end();

  await connectToDB();
  return updateUserProfile(req, res);
}
