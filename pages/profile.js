import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [wins, setWins] = useState([]);
  const [activeTab, setActiveTab] = useState('selling'); // 'selling' | 'wins'
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Review Modal State
  const [showReview, setShowReview] = useState(false);
  const [reviewItem, setReviewItem] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const router = useRouter();

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      if (!stored) {
        router.push('/login');
        return;
      }
      const userData = JSON.parse(stored);
      setUser(userData);
      fetchProfileData(userData.email);
      fetchUnread(userData.email);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchUnread = async (email) => {
    try {
      const res = await fetch(`/api/unread-count?email=${email}`);
      const data = await res.json();
      setUnreadCount(data.count || 0);
    } catch (e) {}
  };

  const fetchProfileData = async (email) => {
    try {
      const res = await fetch(`/api/my-profile?email=${email}`);
      const data = await res.json();
      if (data.listings) setListings(data.listings);
      if (data.wins) setWins(data.wins);
    } catch (error) { console.error(error); }
    setLoading(false);
  };

  const handleDelete = async (listingId) => {
    if (!confirm("Delete this item?")) return;
    try {
        await fetch('/api/delete-listing', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ listing_id: listingId, user_email: user.email }),
        });
        setListings(listings.filter(item => item.id !== listingId));
    } catch (e) { alert("Failed"); }
  };

  // --- NEW GLOSSY ICONS ---
  const InventoryIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-8 h-8 drop-shadow-md">
      <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
    </svg>
  );

  const TrophyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-8 h-8 drop-shadow-md">
      <path d="M20.2 2H3.8L2 5l9 17 9-17-1.8-3zM12 18 5.6 6h12.8L12 18z"/>
    </svg>
  );

  const MessageIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-8 h-8 drop-shadow-md">
      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
    </svg>
  );

  const SellIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-8 h-8 drop-shadow-md">
       <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
    </svg>
  );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#f8f7f4] pb-20 overflow-hidden">
      {/* GLOBAL GRADIENT BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-200/30 rounded-full blur-[100px]"></div>
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[60%] bg-orange-100/40 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[40%] bg-emerald-100/40 rounded-full blur-[100px]"></div>
      </div>

      <Navbar />

      <main className="relative z-10 max-w-5xl mx-auto px-6 pt-32">
        
        {/* --- 1. GLASS HEADER --- */}
        <div className="bg-white/40 backdrop-blur-2xl border border-white/60 p-8 rounded-[40px] shadow-xl mb-10 flex items-center justify-between relative overflow-hidden group">
          {/* Animated Shine Effect */}
          <div className="absolute top-0 -left-full w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 group-hover:animate-[shine_1s_ease-in-out]"></div>

          <div className="flex items-center gap-6">
             <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-orange-400 to-red-500 p-1 shadow-lg">
                <div className="w-full h-full bg-white/90 rounded-full flex items-center justify-center text-3xl font-bold text-gray-800 backdrop-blur-sm">
                   {user.username ? user.username[0].toUpperCase() : user.email[0].toUpperCase()}
                </div>
             </div>
             <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                   Hello, {user.username || user.email.split('@')[0]}
                </h1>
                <p className="text-gray-500 font-medium">Member since 2026</p>
             </div>
          </div>
        </div>

        {/* --- 2. HOLOGRAPHIC DASHBOARD GRID --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-12">
          
          {/* Inventory Card */}
          <button onClick={() => setActiveTab('selling')} className={`relative group p-6 rounded-[30px] border border-white/50 shadow-lg transition-all duration-300 hover:-translate-y-2 overflow-hidden ${activeTab === 'selling' ? 'bg-white/80 ring-4 ring-purple-100' : 'bg-white/30 hover:bg-white/50'}`}>
             <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl -mr-10 -mt-10 transition group-hover:bg-purple-500/30"></div>
             <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mb-4 shadow-lg shadow-purple-200 group-hover:scale-110 transition-transform duration-300">
               <InventoryIcon />
             </div>
             <div className="text-left">
               <span className="block text-2xl font-bold text-gray-900">{listings.length}</span>
               <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">My Garage</span>
             </div>
          </button>

          {/* Wins Card */}
          <button onClick={() => setActiveTab('wins')} className={`relative group p-6 rounded-[30px] border border-white/50 shadow-lg transition-all duration-300 hover:-translate-y-2 overflow-hidden ${activeTab === 'wins' ? 'bg-white/80 ring-4 ring-yellow-100' : 'bg-white/30 hover:bg-white/50'}`}>
             <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/20 rounded-full blur-2xl -mr-10 -mt-10 transition group-hover:bg-yellow-500/30"></div>
             <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mb-4 shadow-lg shadow-yellow-200 group-hover:scale-110 transition-transform duration-300">
               <TrophyIcon />
             </div>
             <div className="text-left">
               <span className="block text-2xl font-bold text-gray-900">{wins.length}</span>
               <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Victories</span>
             </div>
          </button>

          {/* Inbox Card */}
          <Link href="/inbox" className="relative group p-6 rounded-[30px] bg-white/30 border border-white/50 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:bg-white/50 overflow-hidden">
             <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl -mr-10 -mt-10 transition group-hover:bg-blue-500/30"></div>
             <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center mb-4 shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform duration-300 relative">
               <MessageIcon />
               {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>}
             </div>
             <div className="text-left">
               <span className="block text-2xl font-bold text-gray-900">{unreadCount}</span>
               <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Inbox</span>
             </div>
          </Link>

          {/* Sell Card */}
          <Link href="/post-item" className="relative group p-6 rounded-[30px] bg-white/30 border border-white/50 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:bg-white/50 overflow-hidden">
             <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/20 rounded-full blur-2xl -mr-10 -mt-10 transition group-hover:bg-emerald-500/30"></div>
             <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center mb-4 shadow-lg shadow-green-200 group-hover:rotate-90 transition-transform duration-500">
               <SellIcon />
             </div>
             <div className="text-left">
               <span className="block text-2xl font-bold text-gray-900">Sell</span>
               <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">New Item</span>
             </div>
          </Link>

        </div>

        {/* --- 3. FLOATING TOGGLE SWITCH --- */}
        <div className="flex justify-center mb-8">
            <div className="bg-white/40 backdrop-blur-xl p-1.5 rounded-full border border-white/50 flex shadow-inner">
                <button 
                    onClick={() => setActiveTab('selling')}
                    className={`px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 ${activeTab === 'selling' ? 'bg-black text-white shadow-lg scale-105' : 'text-gray-500 hover:text-gray-900'}`}
                >
                    Active Listings
                </button>
                <button 
                    onClick={() => setActiveTab('wins')}
                    className={`px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 ${activeTab === 'wins' ? 'bg-black text-white shadow-lg scale-105' : 'text-gray-500 hover:text-gray-900'}`}
                >
                    My Victories
                </button>
            </div>
        </div>

        {/* --- 4. LISTINGS CONTENT --- */}
        {loading ? <div className="text-center py-20 text-gray-400 font-bold animate-pulse">Loading Profile...</div> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
            
            {(activeTab === 'selling' ? listings : wins).map((item) => (
              <div key={item.id} className="group bg-white/60 backdrop-blur-md rounded-[35px] p-3 border border-white/60 shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                
                {/* TOOLBAR (Edit/Delete) - Appears on Hover */}
                {activeTab === 'selling' && (
                  <div className="absolute top-5 right-5 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Link href={`/edit/${item.id}`}>
                      <button className="bg-white/90 p-2.5 rounded-full text-blue-600 shadow-lg hover:scale-110 transition">✏️</button>
                    </Link>
                    <button onClick={() => handleDelete(item.id)} className="bg-white/90 p-2.5 rounded-full text-red-500 shadow-lg hover:scale-110 transition">🗑️</button>
                  </div>
                )}

                <Link href={`/listing/${item.id}`}>
                  <div className="cursor-pointer">
                    <div className="aspect-[4/3] bg-gray-100 rounded-[30px] overflow-hidden relative mb-4 shadow-inner">
                      {item.image_url ? (
                          <img src={item.image_url} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                      ) : (
                          <div className="flex items-center justify-center h-full text-gray-300">No Photo</div>
                      )}
                      
                      {activeTab === 'wins' && (
                         <div className="absolute inset-0 bg-black/30 flex items-center justify-center backdrop-blur-sm">
                            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-black px-6 py-2 rounded-full shadow-2xl flex items-center gap-2 tracking-widest text-sm">
                                🏆 WON
                            </span>
                         </div>
                      )}
                    </div>
                    
                    <div className="px-3 pb-3">
                      <h3 className="font-bold text-xl text-gray-900 truncate mb-1">{item.title}</h3>
                      <div className="flex justify-between items-center">
                         <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wide ${item.type === 'raffle' ? 'bg-purple-100 text-purple-600' : 'bg-black text-white'}`}>
                           {item.type}
                         </span>
                         <span className="font-black text-xl text-gray-900">
                           {item.type === 'raffle' ? `$${item.ticket_price}` : `$${item.price}`}
                         </span>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* RATE SELLER BUTTON (Wins Only) */}
                {activeTab === 'wins' && (
                    <button onClick={() => {setReviewItem(item); setShowReview(true);}} className="w-full mt-2 bg-black text-white py-4 rounded-[25px] font-bold text-sm shadow-lg hover:bg-gray-800 transition transform active:scale-95">
                        ★ Rate Your Experience
                    </button>
                )}
              </div>
            ))}

            {(activeTab === 'selling' ? listings : wins).length === 0 && (
              <div className="col-span-full py-20 text-center bg-white/30 backdrop-blur-md rounded-[40px] border border-white border-dashed">
                 <div className="text-6xl mb-4 opacity-30 grayscale">
                    {activeTab === 'selling' ? '🚗' : '🏆'}
                 </div>
                 <p className="text-gray-500 font-bold text-lg">Empty Space</p>
                 <p className="text-gray-400 text-sm">Time to make some moves.</p>
              </div>
            )}

          </div>
        )}
      </main>

      {/* REVIEW MODAL */}
      {showReview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white/90 backdrop-blur-2xl p-8 rounded-[40px] w-full max-w-sm shadow-2xl border border-white animate-fade-in">
            <h3 className="text-3xl font-extrabold mb-2 text-center text-gray-900">Rating</h3>
            <p className="text-center text-gray-500 mb-8 font-medium">How was your deal with {reviewItem?.user_email}?</p>
            
            <div className="flex justify-center gap-2 mb-8">
                {[1,2,3,4,5].map(star => (
                  <button key={star} onClick={() => setRating(star)} className={`text-4xl transition hover:scale-125 hover:-translate-y-1 ${rating >= star ? 'text-yellow-400 drop-shadow-lg' : 'text-gray-200'}`}>★</button>
                ))}
            </div>
            
            <textarea 
                placeholder="Leave a comment..." 
                className="w-full bg-white border-none rounded-2xl p-4 mb-4 shadow-inner text-gray-700 outline-none focus:ring-4 focus:ring-orange-100 resize-none h-32"
                value={comment} onChange={e=>setComment(e.target.value)}
            ></textarea>
            
            <div className="flex gap-3">
                <button onClick={() => setShowReview(false)} className="flex-1 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition">Cancel</button>
                <button className="flex-1 bg-black text-white py-4 rounded-2xl font-bold shadow-xl hover:scale-105 transition">Post Review</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}