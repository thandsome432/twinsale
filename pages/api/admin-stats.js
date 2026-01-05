import db from '../../db';

export default async function handler(req, res) {
  try {
    // 1. Count Total Listings
    const listingsRes = await db.query("SELECT COUNT(*) FROM listings");
    
    // 2. Calculate Total Volume (Money Exchanged)
    // We sum the price of all SOLD items + Raffle Tickets Sold * Price
    const volumeRes = await db.query(`
      SELECT SUM(
        CASE 
          WHEN type = 'raffle' THEN (tickets_sold * ticket_price)
          ELSE price 
        END
      ) as total 
      FROM listings 
      WHERE status = 'sold' OR tickets_sold > 0
    `);

    // 3. Count Total Messages
    const msgRes = await db.query("SELECT COUNT(*) FROM messages");

    // 4. Count Total Reviews
    const reviewRes = await db.query("SELECT COUNT(*) FROM reviews");

    // 5. Get List of ALL Listings (for the admin table)
    const allListings = await db.query("SELECT * FROM listings ORDER BY id DESC LIMIT 50");

    res.status(200).json({
      total_listings: listingsRes.rows[0].count,
      total_volume: volumeRes.rows[0].total || 0,
      total_messages: msgRes.rows[0].count,
      total_reviews: reviewRes.rows[0].count,
      recent_items: allListings.rows
    });

  } catch (error) {
    console.error("Admin Stats Error:", error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
}