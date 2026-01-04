import db from '../../db';

export default async function handler(req, res) {
  // Only allow POST requests (sending data)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { listing_id, user_email, role, selfie_url } = req.body;

  try {
    // 1. Check if a meetup record already exists for this item
    const check = await db.query(
      "SELECT * FROM meetups WHERE listing_id = $1", 
      [listing_id]
    );

    let result;
    
    // 2. Logic: If no record exists, CREATE one. If it does, UPDATE it.
    if (check.rows.length === 0) {
      // Create NEW record
      const insertQuery = role === 'buyer' 
        ? "INSERT INTO meetups (listing_id, buyer_email, seller_email, buyer_selfie) VALUES ($1, $2, 'pending', $3) RETURNING *"
        : "INSERT INTO meetups (listing_id, buyer_email, seller_email, seller_selfie) VALUES ($1, 'pending', $2, $3) RETURNING *";
      
      result = await db.query(insertQuery, [listing_id, user_email, selfie_url]);
    
    } else {
      // Update EXISTING record
      const updateQuery = role === 'buyer'
        ? "UPDATE meetups SET buyer_selfie = $1, buyer_email = $2 WHERE listing_id = $3 RETURNING *"
        : "UPDATE meetups SET seller_selfie = $1, seller_email = $2 WHERE listing_id = $3 RETURNING *";

      result = await db.query(updateQuery, [selfie_url, user_email, listing_id]);
    }

    // 3. Return the updated meetup info to the frontend
    res.status(200).json({ success: true, meetup: result.rows[0] });

  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ success: false, error: 'Database connection failed' });
  }
}