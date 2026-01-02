import Navbar from '../../components/Navbar';
import db from '../../db';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function ListingDetail({ item, highestBid }) {
  const router = useRouter();
  const [bidAmount, setBidAmount] = useState('');
  const [currentPrice, setCurrentPrice] = useState(highestBid || 0);

  // Helper to check if user is logged in
  const [user, setUser] = useState(null);
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const handleBid = async (e) => {
    e.preventDefault();
    if (!user) return alert("Please Log In to bid!");
    if (parseFloat(bidAmount) <= parseFloat(currentPrice)) {
      return alert(`Your bid must be higher than $${currentPrice}`);
    }

    const res = await fetch('/api/place-bid', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        listingId: item.id,
        bidderId: user.id,
        amount: bidAmount
      }),
    });

    if (res.ok) {
      setCurrentPrice(bidAmount);
      alert("🎉 Bid Placed Successfully!");
      setBidAmount('');
      router.replace(router.asPath); // Refresh page to show new data
    } else {
      alert("Bidding failed. Try again.");
    }
  };

  const handleBuyTicket = () => {
    alert('Ticket system coming next!');
  };

  if (!item) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto p-6 mt-10">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col md:flex-row">
          
          {/* Left: Image Placeholder */}
          <div className="md:w-1/2 bg-gray-200 min-h-[300px] flex items-center justify-center text-4xl">
             📦
          </div>

          {/* Right: Details */}
          <div className="p-8 md:w-1/2 flex flex-col justify-between">
            <div>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase mb-4 ${
                  item.type === 'raffle' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {item.type === 'raffle' ? '🎟️ Raffle' : '🔨 Auction'}
              </span>

              <h1 className="text-3xl font-bold text-gray-900 mb-2">{item.title}</h1>
              <p className="text-gray-600 mb-6">{item.description}</p>

              {/* DYNAMIC PRICE DISPLAY */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
                <span className="text-gray-500 text-sm">
                  {item.type === 'raffle' ? 'Ticket Price' : 'Current Highest Bid'}
                </span>
                <div className="text-3xl font-bold text-brand-blue">
                  ${item.type === 'raffle' ? item.ticket_price : currentPrice}
                </div>
              </div>
            </div>

            {/* ACTION AREA */}
            <div className="mt-4">
              {item.type === 'raffle' ? (
                <button 
                  onClick={handleBuyTicket}
                  className="w-full bg-purple-600 text-white py-4 rounded-lg font-bold text-lg shadow hover:bg-purple-700 transition"
                >
                  Buy Ticket (${item.ticket_price})
                </button>
              ) : (
                <form onSubmit={handleBid} className="flex gap-2">
                  <input 
                    type="number" 
                    placeholder={`Min $${parseFloat(currentPrice) + 1}`}
                    className="flex-1 p-3 border rounded-lg"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    required
                  />
                  <button type="submit" className="bg-blue-600 text-white px-6 rounded-lg font-bold hover:bg-blue-700">
                    Place Bid
                  </button>
                </form>
              )}
              {!user && <p className="text-xs text-red-500 mt-2">You must login to bid.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// SERVER SIDE: Fetch Item AND Highest Bid
export async function getServerSideProps(context) {
  const { id } = context.params;

  try {
    // 1. Get Listing Details
    const itemQuery = `
      SELECT listings.*, raffles.ticket_price 
      FROM listings 
      LEFT JOIN raffles ON listings.id = raffles.listing_id 
      WHERE listings.id = $1
    `;
    const itemRes = await db.query(itemQuery, [id]);
    
    if (itemRes.rows.length === 0) return { notFound: true };

    // 2. Get Highest Bid (for Auctions)
    const bidRes = await db.query(
      "SELECT MAX(amount) as max_bid FROM bids WHERE listing_id = $1", 
      [id]
    );
    const highestBid = bidRes.rows[0].max_bid || 0; // Default to 0 if no bids

    // Convert dates/decimals to simple strings to avoid "Serialization" errors
    const item = JSON.parse(JSON.stringify(itemRes.rows[0]));

    return {
      props: {
        item,
        highestBid: parseFloat(highestBid), // Ensure it's a number
      },
    };
  } catch (error) {
    console.error(error);
    return { notFound: true };
  }
}