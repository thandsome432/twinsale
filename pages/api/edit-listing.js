import db from '../../db';

export default async function handler(req, res) {
  if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' });

  const { id, user_email, title, description, price } = req.body;

  try {
    // 1. Security Check: Are you the owner?
    const checkRes = await db.query("SELECT user_email FROM listings WHERE id = $1", [id]);
    const item = checkRes.rows[0];

    if (!item) return res.status(404).json({ error: 'Item not found' });
    if (item.user_email !== user_email) return res.status(403).json({ error: 'Unauthorized' });

    // 2. Update the Item
    // Note: We only update Title, Description, and Price.
    // We do NOT allow changing the "Type" (Auction/Raffle) because that breaks active bids.
    await db.query(
      "UPDATE listings SET title = $1, description = $2, price = $3 WHERE id = $4",
      [title, description, price, id]
    );

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Edit Error:", error);
    res.status(500).json({ error: 'Failed to update listing' });
  }
}