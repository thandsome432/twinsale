import db from '../../db';

export default async function handler(req, res) {
  const { email } = req.query;
  if (!email) return res.status(400).json({ count: 0 });

  try {
    // Count messages where I am the receiver AND I haven't read them yet
    const result = await db.query(
      "SELECT COUNT(*) FROM messages WHERE receiver_email = $1 AND is_read = FALSE",
      [email]
    );

    res.status(200).json({ count: parseInt(result.rows[0].count) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ count: 0 });
  }
}