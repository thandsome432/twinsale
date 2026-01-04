import db from '../../db';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { 
    title, 
    description, 
    price, 
    category, 
    image_url, 
    user_email, 
    type,            // New: 'auction' or 'raffle'
    ticket_price,    // New: for raffles
    total_tickets    // New: for raffles
  } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO listings (
        title, description, price, category, image_url, user_email, 
        type, ticket_price, total_tickets, tickets_sold, bid_count, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 0, 0, 'active') 
      RETURNING *`,
      [
        title, 
        description, 
        price || 0, 
        category, 
        image_url, 
        user_email,
        type || 'auction',
        ticket_price || 0,
        total_tickets || 0
      ]
    );

    res.status(200).json({ success: true, listing: result.rows[0] });
  } catch (error) {
    console.error("Create Listing Error:", error);
    res.status(500).json({ success: false, error: 'Failed to create listing' });
  }
}