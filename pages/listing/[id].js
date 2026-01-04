import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import db from '../../db';
import { useRouter } from 'next/router';

export default function ListingDetails({ item, chats = [], meetupStatus = {} }) {
  const [user, setUser] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [showSafety, setShowSafety] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState(chats);
  const [meetup, setMeetup] = useState(meetupStatus);
  const [uploading, setUploading] = useState(false);
  
  // AUCTION STATE
  const [bidAmount, setBidAmount] = useState('');
  const [currentPrice, setCurrentPrice] = useState(item ? item.price : 0);
  const [bidCount, setBidCount] = useState(item ? item.bid_count : 0);

  // RAFFLE STATE
  const [ticketsSold, setTicketsSold] = useState(item ? item.tickets_sold : 0);
  const [ticketPrice, setTicketPrice] = useState(item ? (item.ticket_price || 10) : 10); // Default $10 if null
  const [totalTickets, setTotalTickets] = useState(item ? (item.total_tickets || 100) : 100); // Default 100 if null

  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 300; 
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.5)); 
        };
      };
    });
  };

  const isSeller = user && item && user.email === item.user_email;
  const myRole = isSeller ? 'seller' : 'buyer';
  const mySelfie = isSeller ? meetup?.seller_selfie : meetup?.buyer_selfie;
  const theirSelfie = isSeller ? meetup?.buyer_selfie : meetup?.seller_selfie;
  const isDealVerified = meetup?.seller_selfie && meetup?.buyer_selfie;
  const isCompleted = meetup?.status === 'completed';

  // --- ACTIONS ---
  const handlePlaceBid = async (e) => {
    e.preventDefault();
    if (!user) return alert("Please log in.");
    if (parseFloat(bidAmount) <= parseFloat(currentPrice)) return alert(`Bid higher than $${currentPrice}`);

    const res = await fetch('/api/place-bid', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listing_id: item.id, user_email: user.email, amount: bidAmount }),
    });
    const data = await res.json();
    if (data.success) {
      setCurrentPrice(data.new_price);
      setBidCount(bidCount + 1);
      setBidAmount('');
      alert("🎉 Bid Placed!");
    } else alert(data.error);
  };

  const handleBuyTicket = async () => {
    if (!user) return alert("Please log in.");
    if (!confirm(`Buy a ticket for $${ticketPrice}?`)) return;

    const res = await fetch('/api/buy-ticket', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listing_id: item.id, user_email: user.email }),
    });
    const data = await res.json();
    if (data.success) {
      setTicketsSold(ticketsSold + 1);
      alert("🎟️ Ticket Purchased! Good luck!");
    } else alert(data.error);
  };

  // ... (Keep handleSendMessage, handleSelfieUpload, handleCompleteTransaction same as before) ...
  // Re-pasting them briefly for completeness:
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    const newMessage = { sender_email: user.email, content: message, created_at: new Date() };
    setChatHistory([...chatHistory, newMessage]);
    setMessage('');
    await fetch('/api/send-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listing_id: item.id, sender_email: user.email, receiver_email: item.user_email, content: message }),
    });
  };

  const handleSelfieUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const compressed = await compressImage(file);
      const res = await fetch('/api/update-meetup', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listing_id: item.id, user_email: user.email, role: myRole, selfie_url: compressed })
      });
      const data = await res.json();
      if (data.success) { setMeetup(data.meetup); alert("✅ Verified!"); }
    } catch (e) { alert("Upload failed"); }
    setUploading(false);
  };

  const handleCompleteTransaction = async () => {
    if (!confirm("Confirm sale?")) return;
    const res = await fetch('/api/complete-transaction', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listing_id: item.id })
    });
    const data = await res.json();
    if (data.success) { alert("Done!"); router.push('/'); }
  };

  if (!item) return <div className="text-center mt-20">Item not found</div>;

  // LOGIC: Is this a Raffle or Auction?
  // We check if the item type (converted to lowercase) is 'raffle'
  const isRaffle = item.type && item.type.toLowerCase() === 'raffle';

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      
      <main className="max-w-5xl mx-auto p-4 md:p-8 mt-6 grid md:grid-cols-2 gap-10">
        
        {/* LEFT: Image */}
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-2xl shadow-sm border">
            <div className="aspect-square bg-gray-200 rounded-xl overflow-hidden flex items-center justify-center relative">
               {item.image_url ? <img src={item.image_url} className="w-full h-full object-cover" /> : <span className="text-gray-400">No Photo</span>}
               {/* Badge */}
               <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold uppercase text-white shadow-md ${isRaffle ? 'bg-purple-600' : 'bg-black'}`}>
                 {isRaffle ? '🎟️ Raffle' : '🔨 Auction'}
               </div>
            </div>
          </div>
          
          {/* Safety Box */}
          {isCompleted ? (
            <div className="bg-green-100 p-6 rounded-2xl border border-green-400 text-center"><h3 className="text-2xl font-bold text-green-800">Sold!</h3></div>
          ) : (
            <div className={`p-6 rounded-2xl border-2 transition-all ${isDealVerified ? 'bg-green-50 border-green-500' : 'bg-gray-100 border-dashed'}`}>
              <h3 className={`font-bold text-lg mb-2 ${isDealVerified ? 'text-green-800' : 'text-gray-500'}`}>
                {isDealVerified ? '🔓 Location Unlocked' : '🔒 Location Locked'}
              </h3>
              {isDealVerified ? <p>📍 Odessa Police Dept.</p> : <p className="text-sm">Upload selfie to view location.</p>}
            </div>
          )}
        </div>

        {/* RIGHT: Info & Action */}
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{item.title}</h1>
            
            {/* --- DYNAMIC PRICING AREA --- */}
            {isRaffle ? (
              <div className="mb-6">
                <div className="flex items-baseline gap-3 mb-2">
                  <p className="text-3xl font-bold text-purple-600">${ticketPrice}</p>
                  <span className="text-gray-500 font-medium">per ticket</span>
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                  <div 
                    className="bg-purple-600 h-4 rounded-full transition-all duration-500" 
                    style={{ width: `${(ticketsSold / totalTickets) * 100}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 font-bold">{ticketsSold} / {totalTickets} Sold</p>
              </div>
            ) : (
              <div className="flex items-baseline gap-3 mb-4">
                 <p className="text-3xl font-bold text-brand-blue">${Number(currentPrice).toLocaleString()}</p>
                 <span className="text-gray-500 font-medium">({bidCount} Bids)</span>
              </div>
            )}

            {/* --- ACTION BUTTONS --- */}
            {!isCompleted && !isSeller && (
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
                {isRaffle ? (
                  // RAFFLE BUTTON
                  ticketsSold >= totalTickets ? (
                    <button disabled className="w-full bg-gray-400 text-white py-3 rounded-lg font-bold">Sold Out</button>
                  ) : (
                    <button 
                      onClick={handleBuyTicket}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-bold shadow-lg transition flex justify-center items-center gap-2"
                    >
                      🎟️ Buy Ticket (${ticketPrice})
                    </button>
                  )
                ) : (
                  // AUCTION INPUT
                  <form onSubmit={handlePlaceBid} className="flex gap-2">
                    <input type="number" min={Number(currentPrice) + 1} value={bidAmount} onChange={e => setBidAmount(e.target.value)} placeholder={`Bid $${Number(currentPrice)+1}+`} className="flex-1 border p-2 rounded" />
                    <button className="bg-black text-white px-6 py-2 rounded font-bold">Place Bid</button>
                  </form>
                )}
              </div>
            )}
            
            {isSeller && <p className="text-gray-400 italic mb-4">You are the seller.</p>}
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-100">
             <h3 className="font-bold mb-2">Description</h3>
             <p className="text-gray-600">{item.description}</p>
          </div>

          <div className="flex gap-4">
             {user ? (
               <button onClick={() => setShowChat(!showChat)} className="flex-1 bg-brand-blue text-white py-4 rounded-xl font-bold shadow-lg">💬 Message Seller</button>
             ) : (
               <button className="flex-1 bg-gray-300 text-gray-500 py-4 rounded-xl font-bold cursor-not-allowed">Log in to Chat</button>
             )}
          </div>
        </div>
      </main>

      {/* CHAT & MODALS (Condensed for brevity - they remain the same) */}
      {showChat && (
        <div className="fixed bottom-4 right-4 w-96 bg-white rounded-t-xl shadow-2xl border z-40 h-[500px] flex flex-col">
          <div className="bg-brand-blue text-white p-4 flex justify-between"><h3>Chat</h3><button onClick={() => setShowChat(false)}>✕</button></div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">{chatHistory.map((m,i) => <div key={i} className={m.sender_email===user?.email?'text-right':'text-left'}><span className="bg-gray-100 p-2 rounded inline-block">{m.content}</span></div>)}</div>
          {isDealVerified && !isCompleted && <div className="p-2"><button onClick={handleCompleteTransaction} className="w-full bg-green-600 text-white py-2 rounded">✅ Complete Sale</button></div>}
          {!isDealVerified && !isCompleted && <div className="p-2 bg-blue-50 flex justify-between"><span className="text-xs">Safety Check</span><button onClick={() => setShowSafety(true)} className="text-xs bg-white border px-2 rounded">📷 Verify</button></div>}
          <form onSubmit={handleSendMessage} className="p-2 border-t flex"><input value={message} onChange={e=>setMessage(e.target.value)} className="flex-1 border p-2"/><button>➤</button></form>
        </div>
      )}

      {showSafety && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
           <div className="bg-white p-6 rounded-xl text-center">
             <h3>Safety Check 🛡️</h3>
             {mySelfie ? <img src={mySelfie} className="w-32 h-32 rounded-full mx-auto border-4 border-green-500 mt-4"/> : 
               <label className="block border-2 border-dashed p-10 mt-4 cursor-pointer">
                 {uploading ? "Uploading..." : "Tap to Take Selfie"}
                 <input type="file" accept="image/*" capture="user" className="hidden" onChange={handleSelfieUpload}/>
               </label>
             }
             <button onClick={() => setShowSafety(false)} className="mt-4 bg-gray-200 w-full py-2 rounded">Close</button>
           </div>
        </div>
      )}
    </div>
  );
}

export async function getServerSideProps(context) {
  const { id } = context.params;
  const itemRes = await db.query("SELECT * FROM listings WHERE id = $1", [id]);
  const chatRes = await db.query("SELECT * FROM messages WHERE listing_id = $1 ORDER BY created_at ASC", [id]);
  const meetupRes = await db.query("SELECT * FROM meetups WHERE listing_id = $1", [id]);
  return { props: { 
    item: JSON.parse(JSON.stringify(itemRes.rows[0] || null)), 
    chats: JSON.parse(JSON.stringify(chatRes.rows)),
    meetupStatus: JSON.parse(JSON.stringify(meetupRes.rows[0] || null))
  }};
}