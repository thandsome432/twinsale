import db from '../../../db';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { username, email, password } = req.body;

  try {
    // 1. Check if user already exists
    const check = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    if (check.rows.length > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // 2. Hash the password (encrypt it)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Save to Database
    const result = await db.query(
      "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username",
      [username, email, hashedPassword]
    );

    const user = result.rows[0];
    res.status(200).json({ success: true, user });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Signup failed" });
  }
}