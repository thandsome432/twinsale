import db from '../../db';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { listing_id, sender_email, receiver_email, content } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO messages (listing_id, sender_email, receiver_email, content) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [listing_id, sender_email, receiver_email, content]
    );
    res.status(200).json({ success: true, message: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to send message' });
  }
}