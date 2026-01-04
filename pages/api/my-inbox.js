import db from '../../db';

export default async function handler(req, res) {
  const { email } = req.query;

  if (!email) return res.status(400).json({ error: 'Email required' });

  try {
    // 1. (NEW) Mark all my received messages as READ because I am opening the inbox
    await db.query("UPDATE messages SET is_read = TRUE WHERE receiver_email = $1", [email]);

    // 2. Fetch the messages (Same as before)
    const query = `
      SELECT 
        m.id, m.listing_id, m.sender_email, m.receiver_email, m.content, m.created_at,
        l.title as item_title, l.image_url as item_image, l.user_email as owner_email
      FROM messages m
      JOIN listings l ON m.listing_id = l.id
      WHERE m.sender_email = $1 OR m.receiver_email = $1
      ORDER BY m.created_at DESC
    `;
    
    const result = await db.query(query, [email]);
    res.status(200).json({ messages: result.rows });

  } catch (error) {
    console.error("Inbox Error:", error);
    res.status(500).json({ error: 'Failed to load inbox' });
  }
}