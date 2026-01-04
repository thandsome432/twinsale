import db from '../../db';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { listing_id } = req.body;

  try {
    // 1. Wipe the selfies (Privacy Protection)
    const meetupRes = await db.query(
      `UPDATE meetups 
       SET buyer_selfie = NULL, seller_selfie = NULL, status = 'completed' 
       WHERE listing_id = $1 
       RETURNING *`,
      [listing_id]
    );

    // 2. Mark the ITEM as 'sold' (Marketplace Cleanup)
    await db.query("UPDATE listings SET status = 'sold' WHERE id = $1", [listing_id]);

    res.status(200).json({ success: true, meetup: meetupRes.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to complete transaction' });
  }
}