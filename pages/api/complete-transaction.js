import db from '../../db';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { listing_id } = req.body;

  try {
    // 1. Wipe the selfies (set them to NULL) and mark status as 'completed'
    const result = await db.query(
      `UPDATE meetups 
       SET buyer_selfie = NULL, seller_selfie = NULL, status = 'completed' 
       WHERE listing_id = $1 
       RETURNING *`,
      [listing_id]
    );

    // Optional: You could also mark the Listing as "Sold" here if you have a status column in listings
    // await db.query("UPDATE listings SET status = 'sold' WHERE id = $1", [listing_id]);

    res.status(200).json({ success: true, meetup: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to complete transaction' });
  }
}