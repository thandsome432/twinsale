import db from '../../db';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  // NOW RECEIVING: category and image_url
  const { title, description, price, type, category, image_url } = req.body;

  try {
    const query = `
      INSERT INTO listings (seller_id, title, type, status, category, image_url)
      VALUES ($1, $2, $3, 'active', $4, $5)
      RETURNING id;
    `;
    
    // For MVP, we default seller_id to 1. 
    // (If you have auth working, you can get the real user ID from the session/request)
    const values = [1, title, type, category, image_url];
    
    const result = await db.query(query, values);
    const newListingId = result.rows[0].id;

    if (type === 'raffle') {
       await db.query(
         `INSERT INTO raffles (listing_id, ticket_price, total_tickets) VALUES ($1, $2, $3)`,
         [newListingId, price, 50]
       );
    } else {
        // If it's an auction, set the starting bid?
        // (Optional logic here)
    }

    res.status(200).json({ success: true, id: newListingId });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database connection failed' });
  }
}