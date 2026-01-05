import db from '../../db';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // --- SAVE A REVIEW ---
    const { reviewer_email, reviewed_email, listing_id, rating, comment } = req.body;

    try {
      // Prevent duplicate reviews for the same item
      const check = await db.query(
        "SELECT * FROM reviews WHERE listing_id = $1 AND reviewer_email = $2",
        [listing_id, reviewer_email]
      );

      if (check.rows.length > 0) {
        return res.status(400).json({ error: "You already reviewed this transaction." });
      }

      await db.query(
        "INSERT INTO reviews (reviewer_email, reviewed_email, listing_id, rating, comment) VALUES ($1, $2, $3, $4, $5)",
        [reviewer_email, reviewed_email, listing_id, rating, comment]
      );

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to submit review" });
    }
  } 
  
  else if (req.method === 'GET') {
    // --- GET SELLER STATS ---
    const { email } = req.query;
    try {
      const result = await db.query(
        "SELECT AVG(rating) as average, COUNT(*) as count FROM reviews WHERE reviewed_email = $1",
        [email]
      );
      
      const stats = result.rows[0];
      return res.status(200).json({ 
        average: stats.average ? parseFloat(stats.average).toFixed(1) : "New",
        count: parseInt(stats.count)
      });
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch stats" });
    }
  }
}