import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Link from 'next/link';

export default function Inbox() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.email) {
      fetchInbox(user.email);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchInbox = async (email) => {
    try {
      const res = await fetch(`/api/my-inbox?email=${email}`);
      const data = await res.json();
      if (data.conversations) {
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-4xl mx-auto p-4 md:p-8 mt-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">📬 My Inbox</h1>

        {loading ? (
          <p className="text-gray-500">Loading messages...</p>
        ) : conversations.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border">
            <p className="text-gray-400 text-lg mb-4">No active chats yet.</p>
            <Link href="/" className="bg-brand-blue text-white px-6 py-2 rounded-full font-bold hover:bg-blue-800">
              Browse Marketplace
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {conversations.map((chat) => (
              <Link key={chat.listing_id} href={`/listing/${chat.listing_id}`}>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition flex gap-4 items-center cursor-pointer">
                  
                  {/* Item Image */}
                  <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    {chat.image_url ? (
                      <img src={chat.image_url} className="w-full h-full object-cover" />
                    ) : (
                      <span className="flex h-full items-center justify-center text-xs text-gray-400">No Pic</span>
                    )}
                  </div>

                  {/* Message Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-gray-900 truncate">{chat.title}</h3>
                      <span className="text-green-600 font-bold text-sm">${chat.price}</span>
                    </div>
                    <p className="text-gray-500 text-sm truncate mt-1">"{chat.last_message}"</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(chat.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Arrow Icon */}
                  <div className="text-gray-300">➜</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}