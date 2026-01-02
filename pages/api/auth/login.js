import db from '../../../db';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, password } = req.body;

  try {
    // 1. Find the user
    const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // 2. Compare the password
    const match = await bcrypt.compare(password, user.password_hash || ""); // Handle cases where hash might be missing
    
    if (!match) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // 3. Success! Return user info (excluding password)
    res.status(200).json({ success: true, user: { id: user.id, username: user.username } });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Login failed" });
  }
}