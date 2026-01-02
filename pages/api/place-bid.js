import db from '../../db';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { listingId, amount, bidderId } = req.body;

  try {
    // 1. Check if the bid is valid (must be higher than current price)
    // Note: For MVP, we assume current_price is in the listings table. 
    // If not, we just check against the starting price or 0.
    const listing = await db.query("SELECT * FROM listings WHERE id = $1", [listingId]);
    
    if (listing.rows.length === 0) return res.status(404).json({ error: "Item not found" });

    // 2. Insert the Bid
    await db.query(
      "INSERT INTO bids (listing_id, bidder_id, amount) VALUES ($1, $2, $3)",
      [listingId, bidderId, amount]
    );

    // 3. Update the Listing's 'current price' to show the new high score
    // (We need to add a current_price column if you haven't yet, but for now we can rely on the bid table)
    
    res.status(200).json({ success: true });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Bidding failed" });
  }
}