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
  
  // NEW: Bidding State
  const [bidAmount, setBidAmount] = useState('');
  const [currentPrice, setCurrentPrice] = useState(item ? item.price : 0);
  const [bidCount, setBidCount] = useState(item ? item.bid_count : 0);

  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  // --- IMAGE COMPRESSION HELPER ---
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

  // --- NEW: HANDLE BIDDING ---
  const handlePlaceBid = async (e) => {
    e.preventDefault();
    if (!user) return alert("Please log in to bid.");
    if (!bidAmount) return;

    if (parseFloat(bidAmount) <= parseFloat(currentPrice)) {
      return alert(`Your bid must be higher than $${currentPrice}`);
    }

    try {
      const res = await fetch('/api/place-bid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listing_id: item.id,
          user_email: user.email,
          amount: bidAmount
        }),
      });
      
      const data = await res.json();
      if (data.success) {
        setCurrentPrice(data.new_price);
        setBidCount(bidCount + 1);
        setBidAmount('');
        alert("🎉 Bid Placed Successfully!");
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert("Bid failed.");
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage = { sender_email: user.email, content: message, created_at: new Date() };
    setChatHistory([...chatHistory, newMessage]);
    setMessage('');

    await fetch('/api/send-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        listing_id: item.id,
        sender_email: user.email,
        receiver_email: item.user_email || 'seller@test.com',
        content: message
      }),
    });
  };

  const handleSelfieUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const compressedBase64 = await compressImage(file);
      const dbRes = await fetch('/api/update-meetup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listing_id: item.id,
          user_email: user.email,
          role: myRole,
          selfie_url: compressedBase64 
        }),
      });
      const dbData = await dbRes.json();
      if (dbData.success) {
        setMeetup(dbData.meetup); 
        alert("✅ Selfie Uploaded!");
      } 
    } catch (err) {
      alert("Error uploading.");
    }
    setUploading(false);
  };

  const handleCompleteTransaction = async () => {
    if (!confirm("Are you sure? This will delete all selfies and mark the item as sold.")) return;
    const res = await fetch('/api/complete-transaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listing_id: item.id }),
    });
    const data = await res.json();
    if (data.success) {
      setMeetup(data.meetup);
      alert("Transaction Completed! Selfies deleted.");
      setShowChat(false);
      router.push('/'); 
    }
  };

  if (!item) return <div className="text-center mt-20">Item not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      
      <main className="max-w-5xl mx-auto p-4 md:p-8 mt-6 grid md:grid-cols-2 gap-10">
        
        {/* LEFT COLUMN: Image & Status */}
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-2xl shadow-sm border">
            <div className="aspect-square bg-gray-200 rounded-xl overflow-hidden flex items-center justify-center relative">
               {item.image_url ? (
                  <img src={item.image_url} className="w-full h-full object-cover" />
               ) : (
                  <span className="text-gray-400">No Photo</span>
               )}
            </div>
          </div>
          
          {/* Locked Location Box (Same as before) */}
          {isCompleted ? (
            <div className="bg-green-100 p-6 rounded-2xl border border-green-400 text-center">
              <h3 className="text-2xl font-bold text-green-800">🎉 Sold & Safe!</h3>
              <p className="text-green-700 mt-2">Transaction completed.</p>
            </div>
          ) : (
            <div className={`p-6 rounded-2xl border-2 transition-all duration-500 ${isDealVerified ? 'bg-green-50 border-green-500' : 'bg-gray-100 border-gray-300 border-dashed'}`}>
              <h3 className={`font-bold text-lg mb-2 flex items-center gap-2 ${isDealVerified ? 'text-green-800' : 'text-gray-500'}`}>
                {isDealVerified ? '🔓 Meetup Location Unlocked' : '🔒 Meetup Location Locked'}
              </h3>
              
              {isDealVerified ? (
                <div>
                   <p className="font-bold text-gray-900">📍 Odessa Police Dept. (Safe Zone)</p>
                   <p className="text-sm text-gray-500">205 N Grant Ave, Odessa, TX 79761</p>
                </div>
              ) : (
                <div className="text-sm text-gray-500 mb-4">
                  <p>Upload a selfie to unlock the meeting spot.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Details, Bidding & Chat */}
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{item.title}</h1>
            
            {/* --- BIDDING SECTION --- */}
            <div className="flex items-baseline gap-3 mb-4">
               <p className="text-3xl font-bold text-brand-blue">
                 ${Number(currentPrice).toLocaleString()}
               </p>
               <span className="text-gray-500 font-medium">
                 ({bidCount} Bids)
               </span>
            </div>

            {!isCompleted && (
              <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100 mb-6">
                {isSeller ? (
                  <p className="text-sm text-gray-500 italic text-center">You are the seller.</p>
                ) : (
                  <form onSubmit={handlePlaceBid} className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-2 text-gray-400">$</span>
                      <input 
                        type="number" 
                        min={Number(currentPrice) + 1}
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        placeholder={`Enter $${Number(currentPrice) + 1} or more`}
                        className="w-full border border-gray-300 rounded-lg py-2 pl-8 pr-4 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <button type="submit" className="bg-black text-white px-6 py-2 rounded-lg font-bold hover:bg-gray-800 transition">
                      Place Bid
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-700 mb-2">Description</h3>
            <p className="text-gray-600 leading-relaxed">{item.description}</p>
          </div>

          <div className="flex gap-4">
             {user ? (
               <button 
                 onClick={() => setShowChat(!showChat)}
                 className="flex-1 bg-brand-blue text-white py-4 rounded-xl font-bold shadow-lg hover:bg-blue-800 transition flex items-center justify-center gap-2"
               >
                 💬 Message Seller
               </button>
             ) : (
               <button className="flex-1 bg-gray-300 text-gray-500 py-4 rounded-xl font-bold cursor-not-allowed">
                 Log in to Chat
               </button>
             )}
          </div>
        </div>
      </main>
      
      {/* (Keep Chat Box & Selfie Modal Logic exactly as it was - omitted here to save space but assume it exists below!) */}
      {showChat && (
        <div className="fixed bottom-4 right-4 w-96 bg-white rounded-t-xl shadow-2xl border border-gray-200 z-40 flex flex-col h-[550px]">
          <div className="bg-brand-blue text-white p-4 rounded-t-xl flex justify-between items-center shadow-md">
            <div>
              <h3 className="font-bold text-lg">Chat</h3>
              <p className="text-xs text-blue-200">
                {isDealVerified ? '✅ Safe to Meet' : '⚠️ Verification Pending'}
              </p>
            </div>
            <button onClick={() => setShowChat(false)} className="text-white hover:bg-blue-700 p-1 rounded">✕</button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {chatHistory.map((msg, i) => (
              <div key={i} className={`flex ${msg.sender_email === user.email ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-xl text-sm ${
                  msg.sender_email === user.email ? 'bg-blue-600 text-white' : 'bg-white border text-gray-800 shadow-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
          </div>

          {/* COMPLETION AREA */}
          {isDealVerified && !isCompleted && (
             <div className="p-3 bg-green-50 border-t border-green-200">
               <button onClick={handleCompleteTransaction} className="w-full bg-green-600 text-white font-bold py-2 rounded-lg shadow hover:bg-green-700 transition">
                 ✅ Mark Sold
               </button>
             </div>
          )}

          {!isDealVerified && !isCompleted && (
             <div className="bg-blue-50 p-2 border-t flex justify-between items-center px-4">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  {mySelfie ? <span className="text-green-600 font-bold">You ✅</span> : <span className="text-red-500 font-bold">You ❌</span>}
                  <span>|</span>
                  {theirSelfie ? <span className="text-green-600 font-bold">Them ✅</span> : <span className="text-red-500 font-bold">Them ❌</span>}
                </div>
                <button onClick={() => setShowSafety(true)} className="text-xs bg-white border border-gray-300 px-2 py-1 rounded shadow-sm hover:bg-gray-100">
                  📷 Verify
                </button>
             </div>
          )}

          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t flex gap-2">
            <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type..." className="flex-1 border rounded-full px-4 py-2" disabled={isCompleted}/>
            <button disabled={isCompleted} className="bg-brand-safe text-white px-4 py-2 rounded-full">➤</button>
          </form>
        </div>
      )}

      {showSafety && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-2xl max-w-sm w-full text-center">
            <h2 className="text-2xl font-bold mb-2">Safety Check 🛡️</h2>
            
            {mySelfie ? (
               <div className="mb-6">
                 <img src={mySelfie} className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-green-500 shadow-md" />
                 <p className="text-green-600 font-bold mt-2">Verified!</p>
               </div>
            ) : (
               <label className="block w-full h-40 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 mb-6">
                 {uploading ? (
                   <span className="text-blue-500 font-bold animate-pulse">Processing...</span>
                 ) : (
                   <>
                     <span className="text-4xl mb-2">📸</span>
                     <span className="text-sm font-bold text-gray-500">Tap to Take Selfie</span>
                   </>
                 )}
                 <input type="file" accept="image/*" capture="user" className="hidden" onChange={handleSelfieUpload} />
               </label>
            )}
            <button onClick={() => setShowSafety(false)} className="w-full bg-gray-200 py-3 rounded-xl font-bold hover:bg-gray-300">Close</button>
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