import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import db from '../../db';

export default function ListingDetails({ item, chats = [], meetupStatus = {} }) {
  const [user, setUser] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [showSafety, setShowSafety] = useState(false); // New Modal state
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState(chats);
  const [meetup, setMeetup] = useState(meetupStatus);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  // Determine if I am the Buyer or Seller
  const isSeller = user && item && user.email === item.user_email;
  const myRole = isSeller ? 'seller' : 'buyer';
  
  // Check if I have already uploaded a selfie
  const mySelfie = isSeller ? meetup?.seller_selfie : meetup?.buyer_selfie;
  const theirSelfie = isSeller ? meetup?.buyer_selfie : meetup?.seller_selfie;

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
    const body = new FormData();
    body.append('file', file);

    // 1. Upload Image to cloud
    try {
      const uploadRes = await fetch('/api/upload', { method: 'POST', body });
      const uploadData = await uploadRes.json();

      if (uploadData.url) {
        // 2. Save Link to Database
        const dbRes = await fetch('/api/update-meetup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            listing_id: item.id,
            user_email: user.email,
            role: myRole,
            selfie_url: uploadData.url
          }),
        });
        const dbData = await dbRes.json();
        if (dbData.success) {
          setMeetup(dbData.meetup);
          alert("Verification Selfie Uploaded! 🛡️");
        }
      }
    } catch (err) {
      alert("Upload failed");
    }
    setUploading(false);
  };

  if (!item) return <div className="text-center mt-20">Item not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      
      <main className="max-w-5xl mx-auto p-4 md:p-8 mt-6 grid md:grid-cols-2 gap-10">
        
        {/* LEFT: Image */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border">
          <div className="aspect-square bg-gray-200 rounded-xl overflow-hidden flex items-center justify-center relative">
             {item.image_url ? (
                <img src={item.image_url} className="w-full h-full object-cover" />
             ) : (
                <span className="text-gray-400">No Photo</span>
             )}
          </div>
        </div>

        {/* RIGHT: Details & Chat Button */}
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{item.title}</h1>
            <p className="text-3xl font-bold text-brand-blue">${item.price}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
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

      {/* --- POPUP CHAT BOX --- */}
      {showChat && (
        <div className="fixed bottom-4 right-4 w-96 bg-white rounded-t-xl shadow-2xl border border-gray-200 z-40 flex flex-col h-[500px]">
          {/* Header */}
          <div className="bg-brand-blue text-white p-4 rounded-t-xl flex justify-between items-center shadow-md">
            <div>
              <h3 className="font-bold text-lg">Chat</h3>
              <p className="text-xs text-blue-200">
                {mySelfie && theirSelfie ? '✅ Both Verified' : '⚠️ Verification Pending'}
              </p>
            </div>
            <button onClick={() => setShowChat(false)} className="text-white hover:bg-blue-700 p-1 rounded">✕</button>
          </div>

          {/* Messages */}
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

          {/* SAFETY BAR (The New Part!) */}
          <div className="bg-blue-50 p-2 border-t flex justify-between items-center px-4">
             <div className="flex items-center gap-2 text-xs text-gray-600">
               <span>Status:</span>
               {mySelfie ? <span className="text-green-600 font-bold">You ✅</span> : <span className="text-red-500 font-bold">You ❌</span>}
               <span>|</span>
               {theirSelfie ? <span className="text-green-600 font-bold">Them ✅</span> : <span className="text-red-500 font-bold">Them ❌</span>}
             </div>
             <button onClick={() => setShowSafety(true)} className="text-xs bg-white border border-gray-300 px-2 py-1 rounded shadow-sm hover:bg-gray-100">
               📷 Verify
             </button>
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t flex gap-2">
            <input 
              type="text" value={message} onChange={(e) => setMessage(e.target.value)}
              placeholder="Type message..." className="flex-1 border rounded-full px-4 py-2"
            />
            <button className="bg-brand-safe text-white px-4 py-2 rounded-full">➤</button>
          </form>
        </div>
      )}

      {/* --- SAFETY MODAL (The Selfie Uploader) --- */}
      {showSafety && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-2xl max-w-sm w-full text-center">
            <h2 className="text-2xl font-bold mb-2">Safety Check 🛡️</h2>
            <p className="text-gray-500 text-sm mb-6">Both users must upload a selfie before meeting.</p>
            
            {mySelfie ? (
               <div className="mb-6">
                 <img src={mySelfie} className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-green-500" />
                 <p className="text-green-600 font-bold mt-2">You are Verified!</p>
               </div>
            ) : (
               <label className="block w-full h-40 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 mb-6">
                 {uploading ? (
                   <span className="text-blue-500 font-bold">Uploading...</span>
                 ) : (
                   <>
                     <span className="text-4xl mb-2">📸</span>
                     <span className="text-sm font-bold text-gray-500">Tap to Take Selfie</span>
                   </>
                 )}
                 <input type="file" accept="image/*" capture="user" className="hidden" onChange={handleSelfieUpload} />
               </label>
            )}

            <button onClick={() => setShowSafety(false)} className="w-full bg-gray-200 py-3 rounded-xl font-bold">
              Close
            </button>
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
  
  // NEW: Check verification status
  const meetupRes = await db.query("SELECT * FROM meetups WHERE listing_id = $1", [id]);

  return { props: { 
    item: JSON.parse(JSON.stringify(itemRes.rows[0] || null)), 
    chats: JSON.parse(JSON.stringify(chatRes.rows)),
    meetupStatus: JSON.parse(JSON.stringify(meetupRes.rows[0] || null))
  }};
}