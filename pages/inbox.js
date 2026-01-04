import { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import { useRouter } from 'next/router';

export default function Inbox() {
  const [user, setUser] = useState(null);
  const [threads, setThreads] = useState([]);
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Auto-scroll to bottom of chat
  const messagesEndRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { router.push('/login'); return; }
    
    const userData = JSON.parse(stored);
    setUser(userData);
    fetchInbox(userData.email);
    
    // Auto-refresh inbox every 5 seconds (Real-time feel)
    const interval = setInterval(() => fetchInbox(userData.email), 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [threads, activeThreadId]);

  const fetchInbox = async (email) => {
    try {
      const res = await fetch(`/api/my-inbox?email=${email}`);
      const data = await res.json();
      organizeThreads(data.messages, email);
      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  // LOGIC: Group raw messages into "Conversations"
  const organizeThreads = (messages, myEmail) => {
    const groups = {};

    messages.forEach(msg => {
      // Determine who the "Other Person" is
      const otherPerson = msg.sender_email === myEmail ? msg.receiver_email : msg.sender_email;
      
      // Create a unique ID for this conversation: "ListingID + OtherPersonEmail"
      const threadKey = `${msg.listing_id}-${otherPerson}`;

      if (!groups[threadKey]) {
        groups[threadKey] = {
          id: threadKey,
          listing_id: msg.listing_id,
          title: msg.item_title,
          image: msg.item_image,
          other_email: otherPerson,
          messages: []
        };
      }
      // Add message to the group (reverse order so oldest is top)
      groups[threadKey].messages.unshift(msg);
    });

    // Convert object to array
    const threadArray = Object.values(groups);
    setThreads(threadArray);
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!reply.trim() || !activeThreadId) return;

    const currentThread = threads.find(t => t.id === activeThreadId);
    if (!currentThread) return;

    // Send to API
    await fetch('/api/send-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        listing_id: currentThread.listing_id,
        sender_email: user.email,
        receiver_email: currentThread.other_email,
        content: reply
      }),
    });

    setReply('');
    fetchInbox(user.email); // Refresh immediately
  };

  const activeThread = threads.find(t => t.id === activeThreadId);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col h-screen">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 flex gap-4 h-[calc(100vh-80px)] overflow-hidden">
        
        {/* LEFT COLUMN: Conversation List */}
        <div className={`w-full md:w-1/3 bg-white rounded-xl shadow border overflow-y-auto ${activeThreadId ? 'hidden md:block' : 'block'}`}>
          <div className="p-4 border-b bg-gray-50">
            <h2 className="font-bold text-xl">Inbox</h2>
          </div>
          
          {loading ? <p className="p-4">Loading...</p> : threads.length === 0 ? (
            <p className="p-4 text-gray-400">No messages yet.</p>
          ) : (
            threads.map(thread => (
              <div 
                key={thread.id} 
                onClick={() => setActiveThreadId(thread.id)}
                className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition flex gap-3 ${activeThreadId === thread.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
              >
                {/* Tiny Item Image */}
                <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                  {thread.image ? <img src={thread.image} className="w-full h-full object-cover" /> : null}
                </div>
                
                <div className="overflow-hidden">
                  <h3 className="font-bold text-sm truncate">{thread.title}</h3>
                  <p className="text-xs text-gray-500 truncate mb-1">with {thread.other_email}</p>
                  <p className="text-sm text-gray-700 truncate">
                    {thread.messages[thread.messages.length - 1].content}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* RIGHT COLUMN: Chat Window */}
        <div className={`flex-1 bg-white rounded-xl shadow border flex flex-col ${!activeThreadId ? 'hidden md:flex' : 'flex'}`}>
          
          {activeThread ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
                <div className="flex items-center gap-3">
                  <button onClick={() => setActiveThreadId(null)} className="md:hidden text-gray-500 font-bold">← Back</button>
                  <span className="font-bold">{activeThread.title}</span>
                  <span className="text-gray-400 text-sm">({activeThread.other_email})</span>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-100">
                {activeThread.messages.map((msg, idx) => {
                   const isMe = msg.sender_email === user.email;
                   return (
                     <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                       <div className={`max-w-[70%] p-3 rounded-xl shadow-sm ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none'}`}>
                         <p>{msg.content}</p>
                         <span className={`text-[10px] block mt-1 ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                           {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                         </span>
                       </div>
                     </div>
                   );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <form onSubmit={handleSendReply} className="p-4 border-t bg-white rounded-b-xl flex gap-2">
                <input 
                  type="text" 
                  value={reply} 
                  onChange={(e) => setReply(e.target.value)} 
                  placeholder="Type a message..." 
                  className="flex-1 border p-3 rounded-full focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button type="submit" className="bg-blue-600 text-white w-12 h-12 rounded-full font-bold shadow hover:bg-blue-700 transition flex items-center justify-center">
                  ➤
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-300">
              <span className="text-6xl mb-4">💬</span>
              <p>Select a conversation to start chatting</p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}