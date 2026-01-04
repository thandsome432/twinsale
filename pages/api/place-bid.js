import db from '../../db';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { listing_id, user_email, amount } = req.body;

  try {
    // 1. Get the current price of the item
    const itemRes = await db.query("SELECT price, title FROM listings WHERE id = $1", [listing_id]);
    const item = itemRes.rows[0];

    if (!item) return res.status(404).json({ error: 'Item not found' });

    // 2. Check if the new bid is higher
    if (parseFloat(amount) <= parseFloat(item.price)) {
      return res.status(400).json({ error: `Bid must be higher than $${item.price}` });
    }

    // 3. Record the Bid
    await db.query(
      "INSERT INTO bids (listing_id, user_email, amount) VALUES ($1, $2, $3)",
      [listing_id, user_email, amount]
    );

    // 4. Update the Listing (New Price + Increase Bid Count)
    // We update the main 'price' column so it shows up correctly in the feed
    await db.query(
      "UPDATE listings SET price = $1, bid_count = bid_count + 1 WHERE id = $2",
      [amount, listing_id]
    );

    res.status(200).json({ success: true, new_price: amount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to place bid' });
  }
}