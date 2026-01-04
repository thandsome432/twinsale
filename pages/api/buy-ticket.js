import db from '../../db';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { listing_id, user_email } = req.body;

  try {
    // 1. Get current status
    const itemRes = await db.query("SELECT total_tickets, tickets_sold FROM listings WHERE id = $1", [listing_id]);
    const item = itemRes.rows[0];

    if (!item) return res.status(404).json({ error: 'Item not found' });

    // 2. Check if sold out
    if (item.tickets_sold >= item.total_tickets) {
      return res.status(400).json({ error: 'Sold Out! No tickets left.' });
    }

    // 3. Record the Entry
    await db.query(
      "INSERT INTO raffle_entries (listing_id, user_email) VALUES ($1, $2)",
      [listing_id, user_email]
    );

    // 4. Update the Count
    await db.query(
      "UPDATE listings SET tickets_sold = tickets_sold + 1 WHERE id = $1",
      [listing_id]
    );

    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to buy ticket' });
  }
}