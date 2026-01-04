import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import db from '../../db';

export default function ListingDetails({ item, chats = [] }) {
  const [user, setUser] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState(chats);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Optimistic UI update (show message immediately)
    const newMessage = { sender_email: user.email, content: message, created_at: new Date() };
    setChatHistory([...chatHistory, newMessage]);
    setMessage('');

    await fetch('/api/send-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        listing_id: item.id,
        sender_email: user.email,
        receiver_email: item.user_email || 'seller@test.com', // Fallback for testing
        content: message
      }),
    });
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
             <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-bold uppercase">
               {item.type}
             </div>
          </div>
        </div>

        {/* RIGHT: Details & Chat Button */}
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{item.title}</h1>
            <p className="text-3xl font-bold text-brand-blue">${item.price}</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-700 mb-2">Description</h3>
            <p className="text-gray-600 leading-relaxed">{item.description}</p>
          </div>

          {/* ACTION BUTTONS */}
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
        <div className="fixed bottom-4 right-4 w-96 bg-white rounded-t-xl shadow-2xl border border-gray-200 z-50 flex flex-col h-[500px]">
          {/* Chat Header */}
          <div className="bg-brand-blue text-white p-4 rounded-t-xl flex justify-between items-center shadow-md">
            <div>
              <h3 className="font-bold text-lg">Chat with Seller</h3>
              <p className="text-xs text-blue-200">Safe Meetup Verified 🛡️</p>
            </div>
            <button onClick={() => setShowChat(false)} className="text-white hover:bg-blue-700 p-1 rounded">✕</button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {chatHistory.length === 0 && (
              <p className="text-center text-gray-400 text-sm mt-10">Start the conversation! Ask about the item.</p>
            )}
            {chatHistory.map((msg, i) => (
              <div key={i} className={`flex ${msg.sender_email === user.email ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-xl text-sm ${
                  msg.sender_email === user.email 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-white border text-gray-800 rounded-bl-none shadow-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t">
            <div className="flex gap-2">
              <input 
                type="text" 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..." 
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:border-brand-blue"
              />
              <button className="bg-brand-safe text-white px-4 py-2 rounded-full font-bold hover:bg-green-600 transition">
                ➤
              </button>
            </div>
             {/* SELFIE BUTTON PLACEHOLDER (We will activate this next!) */}
             <div className="mt-2 flex justify-between items-center px-2">
                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Safety Tools</span>
                <button type="button" className="text-xs flex items-center gap-1 text-gray-500 hover:text-brand-blue transition">
                  📷 Upload Selfie (Required)
                </button>
             </div>
          </form>
        </div>
      )}
    </div>
  );
}

export async function getServerSideProps(context) {
  const { id } = context.params;
  const itemRes = await db.query("SELECT * FROM listings WHERE id = $1", [id]);
  
  // Also fetch previous messages for this item
  const chatRes = await db.query("SELECT * FROM messages WHERE listing_id = $1 ORDER BY created_at ASC", [id]);
  const chats = JSON.parse(JSON.stringify(chatRes.rows));

  return { props: { item: JSON.parse(JSON.stringify(itemRes.rows[0] || null)), chats } };
}