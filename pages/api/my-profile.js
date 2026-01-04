import db from '../../db';

export default async function handler(req, res) {
  const { email } = req.query;

  if (!email) return res.status(400).json({ error: 'Email required' });

  try {
    // 1. Fetch items I am SELLING
    const myListings = await db.query(
      "SELECT * FROM listings WHERE user_email = $1 ORDER BY id DESC", 
      [email]
    );

    // 2. Fetch items I have WON (Optional: You can add this logic later)
    // For now, let's just show what you are selling.

    res.status(200).json({ 
      listings: myListings.rows 
    });

  } catch (error) {
    console.error("Profile API Error:", error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
}