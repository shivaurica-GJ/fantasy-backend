import { connectToDB } from '../../lib/db.js';
import { addUser } from '../../lib/controllers/userController.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  await connectToDB();
  return addUser(req, res);
}
