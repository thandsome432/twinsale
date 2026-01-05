import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import db from '../../db';
import { useRouter } from 'next/router';

export default function ListingDetails({ item, chats = [], meetupStatus = {} }) {
  const [user, setUser] = useState(null);
  
  // --- MODAL STATES ---
  const [showChat, setShowChat] = useState(false);
  const [showSafety, setShowSafety] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  // --- CHECKOUT STATES ---
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // --- DATA STATES ---
  const [sellerRating, setSellerRating] = useState(null); 
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState(chats);
  const [meetup, setMeetup] = useState(meetupStatus);
  const [uploading, setUploading] = useState(false);
  
  // --- AUCTION & RAFFLE STATE ---
  const [bidAmount, setBidAmount] = useState('');
  const [currentPrice, setCurrentPrice] = useState(item ? item.price : 0);
  const [bidCount, setBidCount] = useState(item ? item.bid_count : 0);
  const [ticketsSold, setTicketsSold] = useState(item ? item.tickets_sold : 0);
  const [ticketPrice, setTicketPrice] = useState(item ? (item.ticket_price || 10) : 10);
  const [totalTickets, setTotalTickets] = useState(item ? (item.total_tickets || 100) : 100);
  const [winner, setWinner] = useState(item ? item.winner_email : null);

  const router = useRouter();

  useEffect(() => {
    try {
        const stored = localStorage.getItem('user');
        if (stored) setUser(JSON.parse(stored));

        // Fetch Seller Rating
        if (item && item.user_email) {
        fetch(`/api/reviews?email=${item.user_email}`)
            .then(res => res.json())
            .then(data => setSellerRating(data))
            .catch(err => console.error("Rating fetch error", err));
        }
    } catch(e) {}
  }, [item]);

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
  const isDealVerified = meetup?.seller_selfie && meetup?.buyer_selfie;
  const isCompleted = meetup?.status === 'completed' || meetup?.status === 'sold';
  const isRaffle = item && item.type && item.type.toLowerCase() === 'raffle';

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

  const openCheckout = () => {
    if (!user) return alert("Please log in.");
    setShowCheckout(true);
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setProcessing(true);

    setTimeout(async () => {
        const res = await fetch('/api/buy-ticket', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ listing_id: item.id, user_email: user.email }),
        });
        const data = await res.json();
        setProcessing(false);

        if (data.success) {
            setPaymentSuccess(true);
            setTicketsSold(ticketsSold + 1);
            setTimeout(() => {
                setShowCheckout(false);
                setPaymentSuccess(false);
            }, 2000);
        } else {
            alert(data.error);
        }
    }, 2000);
  };

  const handleDrawWinner = async () => {
    if (!confirm("Are you sure? This will pick a random winner and end the raffle.")) return;
    const res = await fetch('/api/pick-winner', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listing_id: item.id, user_email: user.email }),
    });
    const data = await res.json();
    if (data.success) {
      setWinner(data.winner);
      alert(`🎉 Winner Picked: ${data.winner}`);
    } else alert(data.error);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    const newMessage = { sender_email: user.email, content: message, created_at: new Date() };
    setChatHistory([...chatHistory, newMessage]);
    setMessage('');
    await fetch('/api/send-message', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
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
    if (await res.json().success) { alert("Done!"); router.push('/'); }
  };

  if (!item) return <div className="text-center mt-32">Item not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      
      {/* FIXED PADDING: Changed 'mt-6' to 'pt-36'. 
          This pushes content down below the floating navbar 
      */}
      <main className="max-w-5xl mx-auto p-4 md:p-8 pt-36 grid md:grid-cols-2 gap-10">
        
        {/* LEFT: Image */}
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
            <div className="aspect-square bg-gray-200 rounded-2xl overflow-hidden flex items-center justify-center relative">
               {item.image_url ? <img src={item.image_url} className="w-full h-full object-cover" /> : <span className="text-gray-400">No Photo</span>}
               <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold uppercase text-white shadow-md ${isRaffle ? 'bg-purple-600' : 'bg-black'}`}>
                 {isRaffle ? '🎟️ Raffle' : '🔨 Auction'}
               </div>
            </div>
          </div>
          
          {/* Winner / Safety Box */}
          {winner ? (
            <div className="bg-yellow-100 p-6 rounded-3xl border border-yellow-400 text-center animate-bounce-short">
              <h3 className="text-2xl font-bold text-yellow-800">🎉 WE HAVE A WINNER!</h3>
              <p className="text-yellow-700 mt-2 font-bold text-lg">{winner}</p>
              <p className="text-sm text-yellow-600 mt-1">Check your inbox to arrange pickup!</p>
            </div>
          ) : isCompleted ? (
            <div className="bg-green-100 p-6 rounded-3xl border border-green-400 text-center"><h3 className="text-2xl font-bold text-green-800">Sold!</h3></div>
          ) : (
            <div className={`p-6 rounded-3xl border-2 transition-all ${isDealVerified ? 'bg-green-50 border-green-500' : 'bg-gray-100 border-dashed'}`}>
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
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2 leading-tight">{item.title}</h1>
            
            {isRaffle ? (
              <div className="mb-6">
                <div className="flex items-baseline gap-3 mb-2">
                  <p className="text-3xl font-bold text-purple-600">${ticketPrice}</p>
                  <span className="text-gray-500 font-medium">per ticket</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                  <div className="bg-purple-600 h-4 rounded-full transition-all duration-500" style={{ width: `${(ticketsSold / totalTickets) * 100}%` }}></div>
                </div>
                <p className="text-sm text-gray-600 font-bold">{ticketsSold} / {totalTickets} Sold</p>
              </div>
            ) : (
              <div className="flex items-baseline gap-3 mb-4">
                 <p className="text-3xl font-bold text-brand-blue">${Number(currentPrice).toLocaleString()}</p>
                 <span className="text-gray-500 font-medium">({bidCount} Bids)</span>
              </div>
            )}

            {!isCompleted && !winner && (
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-6">
                {isSeller ? (
                  isRaffle ? (
                    <button onClick={handleDrawWinner} className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-4 rounded-xl font-bold shadow-lg transition text-lg">🎲 Draw Random Winner</button>
                  ) : <p className="text-sm text-gray-500 italic text-center">You are the seller.</p>
                ) : (
                  isRaffle ? (
                    ticketsSold >= totalTickets ? (
                      <button disabled className="w-full bg-gray-400 text-white py-4 rounded-xl font-bold text-lg">Sold Out</button>
                    ) : (
                      <button onClick={openCheckout} className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-xl font-bold shadow-lg transition flex justify-center items-center gap-2 text-lg">🎟️ Buy Ticket (${ticketPrice})</button>
                    )
                  ) : (
                    <form onSubmit={handlePlaceBid} className="flex gap-2">
                      <input type="number" min={Number(currentPrice) + 1} value={bidAmount} onChange={e => setBidAmount(e.target.value)} placeholder={`Bid $${Number(currentPrice)+1}+`} className="flex-1 border p-4 rounded-xl bg-gray-50 text-lg outline-none focus:ring-2 focus:ring-black" />
                      <button className="bg-black text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-gray-800 transition">Place Bid</button>
                    </form>
                  )
                )}
              </div>
            )}
            
          </div>

          {/* SELLER RATING BOX */}
          <div className="bg-white p-5 rounded-3xl border border-gray-100 flex items-center justify-between shadow-sm">
             <div>
               <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Sold By</p>
               <p className="font-bold text-gray-900 text-lg">{item.user_email}</p>
             </div>
             <div className="text-right">
               {sellerRating ? (
                 <>
                   <p className="text-yellow-500 text-xl font-black">★ {sellerRating.average}</p>
                   <p className="text-xs text-gray-400 font-bold">({sellerRating.count} reviews)</p>
                 </>
               ) : (
                 <span className="text-xs text-gray-400">Loading Rating...</span>
               )}
             </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
             <h3 className="font-bold mb-3 text-lg">Description</h3>
             <p className="text-gray-600 whitespace-pre-line leading-relaxed">{item.description}</p>
          </div>

          <div className="flex gap-4">
             {user ? (
               <button onClick={() => setShowChat(!showChat)} className="flex-1 bg-brand-blue text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-blue-800 transition text-lg">💬 Message Seller</button>
             ) : (
               <button className="flex-1 bg-gray-300 text-gray-500 py-4 rounded-2xl font-bold cursor-not-allowed">Log in to Chat</button>
             )}
          </div>
        </div>
      </main>

      {/* --- CHECKOUT MODAL --- */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white max-w-md w-full rounded-[40px] p-8 shadow-2xl relative animate-fade-in">
                
                {!processing && !paymentSuccess && (
                    <button onClick={() => setShowCheckout(false)} className="absolute top-6 right-6 text-gray-400 hover:text-black font-bold text-xl">✕</button>
                )}

                {paymentSuccess ? (
                    <div className="text-center py-10">
                        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-5xl mx-auto mb-6 animate-bounce">✓</div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-2">Approved!</h3>
                        <p className="text-gray-500">You're in the raffle. Good luck!</p>
                    </div>
                ) : processing ? (
                    <div className="text-center py-12">
                         <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-6"></div>
                         <h3 className="text-2xl font-bold text-gray-900">Processing...</h3>
                         <p className="text-sm text-gray-500 mt-2">Connecting to Secure Gateway</p>
                    </div>
                ) : (
                    <form onSubmit={handlePayment}>
                        <h2 className="text-3xl font-bold mb-6">Checkout</h2>
                        <div className="bg-purple-50 p-4 rounded-3xl mb-8 border border-purple-100 flex gap-4 items-center">
                            <div className="w-14 h-14 bg-purple-200 rounded-2xl flex items-center justify-center text-purple-700 text-2xl">🎟️</div>
                            <div>
                                <p className="font-bold text-gray-900 text-lg">{item.title}</p>
                                <p className="text-sm text-gray-500">1 x Raffle Ticket</p>
                            </div>
                            <div className="ml-auto font-black text-xl text-purple-900">${ticketPrice}</div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-2">Card Number</label>
                                <input type="text" placeholder="0000 0000 0000 0000" className="w-full border p-4 rounded-2xl bg-gray-50 font-mono text-lg outline-none focus:ring-2 focus:ring-purple-500" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-2">Expiry</label>
                                    <input type="text" placeholder="MM/YY" className="w-full border p-4 rounded-2xl bg-gray-50 font-mono text-lg outline-none focus:ring-2 focus:ring-purple-500" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-2">CVC</label>
                                    <input type="text" placeholder="123" className="w-full border p-4 rounded-2xl bg-gray-50 font-mono text-lg outline-none focus:ring-2 focus:ring-purple-500" required />
                                </div>
                            </div>
                        </div>

                        <button className="w-full bg-black text-white py-5 rounded-2xl font-bold text-xl shadow-xl hover:scale-[1.02] transition mt-8 flex justify-center items-center gap-2">
                             Pay ${ticketPrice}.00
                        </button>
                        <p className="text-xs text-center text-gray-400 mt-6">🔒 256-bit Secure Encryption</p>
                    </form>
                )}
            </div>
        </div>
      )}

      {/* --- CHAT MODAL --- */}
      {showChat && (
        <div className="fixed bottom-4 right-4 w-96 bg-white rounded-t-3xl shadow-2xl border border-gray-200 z-40 h-[500px] flex flex-col overflow-hidden">
          <div className="bg-brand-blue text-white p-5 flex justify-between items-center">
              <h3 className="font-bold text-lg">Chat with Seller</h3>
              <button onClick={() => setShowChat(false)} className="text-white/80 hover:text-white font-bold text-xl">✕</button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {chatHistory.map((m,i) => (
                  <div key={i} className={`flex ${m.sender_email===user?.email?'justify-end':'justify-start'}`}>
                      <span className={`px-4 py-2 rounded-2xl max-w-[80%] text-sm shadow-sm ${m.sender_email===user?.email?'bg-blue-600 text-white rounded-br-none':'bg-white text-gray-800 rounded-bl-none'}`}>
                          {m.content}
                      </span>
                  </div>
              ))}
          </div>
          
          {/* Action Area */}
          <div className="bg-white p-3 border-t">
              {isDealVerified && !isCompleted && <button onClick={handleCompleteTransaction} className="w-full bg-green-500 text-white py-3 rounded-xl font-bold mb-3 shadow-md hover:bg-green-600 transition">✅ Complete Sale</button>}
              {!isDealVerified && !isCompleted && <div className="flex justify-between items-center bg-blue-50 p-3 rounded-xl mb-3 border border-blue-100"><span className="text-xs text-blue-800 font-bold">Safety Verification</span><button onClick={() => setShowSafety(true)} className="text-xs bg-white text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg font-bold shadow-sm hover:bg-blue-50">📷 Verify</button></div>}
              
              <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input value={message} onChange={e=>setMessage(e.target.value)} className="flex-1 border bg-gray-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Type message..." />
                  <button className="bg-brand-blue text-white w-12 rounded-xl flex items-center justify-center font-bold shadow-md hover:bg-blue-700 transition">➤</button>
              </form>
          </div>
        </div>
      )}

      {/* --- SAFETY MODAL --- */}
      {showSafety && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
           <div className="bg-white p-8 rounded-[40px] text-center max-w-sm w-full animate-fade-in shadow-2xl">
             <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">🛡️</div>
             <h3 className="text-2xl font-bold mb-2">Safety Check</h3>
             <p className="text-gray-500 text-sm mb-6">Upload a selfie to verify your identity and unlock the meetup location.</p>
             
             {mySelfie ? <img src={mySelfie} className="w-40 h-40 rounded-full mx-auto border-4 border-green-500 object-cover shadow-lg mb-6"/> : 
               <label className="block border-2 border-dashed border-gray-300 p-10 rounded-3xl cursor-pointer hover:bg-gray-50 transition mb-6 group">
                 <div className="text-4xl mb-2 group-hover:scale-110 transition">📷</div>
                 <span className="font-bold text-gray-400 group-hover:text-gray-600">Tap to Take Selfie</span>
                 <input type="file" accept="image/*" capture="user" className="hidden" onChange={handleSelfieUpload}/>
               </label>
             }
             
             <button onClick={() => setShowSafety(false)} className="w-full bg-gray-100 text-gray-700 py-4 rounded-2xl font-bold hover:bg-gray-200 transition">Close</button>
           </div>
        </div>
      )}
    </div>
  );
}