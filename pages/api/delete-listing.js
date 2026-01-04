import db from '../../db';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed' });

  const { listing_id, user_email } = req.body;

  try {
    // SQL Logic: Only delete if the ID matches AND the email matches
    const result = await db.query(
      "DELETE FROM listings WHERE id = $1 AND user_email = $2 RETURNING *",
      [listing_id, user_email]
    );

    if (result.rowCount === 0) {
      return res.status(403).json({ error: "You are not authorized to delete this item." });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ error: 'Failed to delete listing' });
  }
}