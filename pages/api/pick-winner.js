import db from '../../db';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { listing_id, user_email } = req.body;

  try {
    // 1. Security Check: Are you the seller?
    const checkRes = await db.query("SELECT * FROM listings WHERE id = $1", [listing_id]);
    const item = checkRes.rows[0];

    if (!item) return res.status(404).json({ error: 'Item not found' });
    if (item.user_email !== user_email) return res.status(403).json({ error: 'Only the seller can pick a winner' });

    // 2. Get all ticket buyers
    const entriesRes = await db.query("SELECT user_email FROM raffle_entries WHERE listing_id = $1", [listing_id]);
    const entries = entriesRes.rows;

    if (entries.length === 0) return res.status(400).json({ error: 'No tickets sold yet!' });

    // 3. Pick a Random Winner
    const randomIndex = Math.floor(Math.random() * entries.length);
    const winner = entries[randomIndex].user_email;

    // 4. Save Winner & Mark as Sold
    await db.query(
      "UPDATE listings SET winner_email = $1, status = 'sold' WHERE id = $2",
      [winner, listing_id]
    );

    res.status(200).json({ success: true, winner });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to pick winner' });
  }
}