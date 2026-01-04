import db from '../../db';

export default async function handler(req, res) {
  const { email } = req.query;

  if (!email) return res.status(400).json({ error: 'Email required' });

  try {
    // This smart query finds every listing you have messaged about.
    // "DISTINCT ON" ensures we only get ONE entry per item (the latest one).
    const text = `
      SELECT DISTINCT ON (m.listing_id) 
        m.listing_id, 
        m.content as last_message, 
        m.created_at, 
        l.title, 
        l.image_url, 
        l.price 
      FROM messages m 
      JOIN listings l ON m.listing_id = l.id 
      WHERE m.sender_email = $1 OR m.receiver_email = $1 
      ORDER BY m.listing_id, m.created_at DESC
    `;
    
    const result = await db.query(text, [email]);
    res.status(200).json({ conversations: result.rows });
  } catch (error) {
    console.error("Inbox Error:", error);
    res.status(500).json({ error: 'Failed to fetch inbox' });
  }
}