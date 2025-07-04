import { connectToDB } from '../../lib/db.js';
import { verifyOtp } from '../../lib/controllers/userController.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  await connectToDB();
  return verifyOtp(req, res);
}
