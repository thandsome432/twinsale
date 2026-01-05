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
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
        await fetch('/api/delete-listing', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ listing_id: listingId, user_email: user.email }),
        });
        setListings(listings.filter(item => item.id !== listingId));
    } catch (e) { alert("Failed"); }
  };

  // --- SVG ICONS ---
  const CarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-emerald-600">
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
      <circle cx="7" cy="17" r="2" />
      <path d="M9 17h6" />
      <circle cx="17" cy="17" r="2" />
    </svg>
  );

  const TrophyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-yellow-600">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2l-7.95 8.94a1 1 0 0 1-1.35.09L6 8.78l7.66-7.67a1 1 0 0 1 1.48.9Z" />
    </svg>
  );

  const InboxIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-blue-600">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />

      {/* --- HEADER (Curved Green Background) --- */}
      <div className="bg-[#0d5c46] pt-28 pb-16 px-6 rounded-b-[40px] shadow-xl relative overflow-hidden">
        {/* Decorative Circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-10 -mb-10 blur-2xl pointer-events-none"></div>

        <div className="max-w-4xl mx-auto flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
             {/* Avatar */}
             <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white text-3xl font-bold border-2 border-white/30 shadow-lg">
                {user.username ? user.username[0].toUpperCase() : user.email[0].toUpperCase()}
             </div>
             <div>
                <p className="text-emerald-100 text-sm font-medium">Welcome back,</p>
                <h1 className="text-3xl font-bold text-white tracking-tight">{user.username || user.email.split('@')[0]}</h1>
             </div>
          </div>

          {/* Inbox Notification Bell */}
          <Link href="/inbox">
            <div className="relative w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/20 transition cursor-pointer border border-white/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0d5c46]"></span>
              )}
            </div>
          </Link>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 -mt-8 relative z-20">
        
        {/* --- DASHBOARD GRID (Service Categories Style) --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          
          {/* Card 1: My Garage (Selling) */}
          <button 
             onClick={() => setActiveTab('selling')}
             className={`bg-white p-5 rounded-3xl shadow-sm border transition-all duration-300 flex flex-col items-center justify-center gap-3 group ${activeTab === 'selling' ? 'ring-4 ring-emerald-500/20 border-emerald-500 scale-105 shadow-xl' : 'hover:shadow-md border-gray-100'}`}
          >
             <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition">
               <CarIcon />
             </div>
             <div className="text-center">
               <span className="block font-bold text-gray-800">My Garage</span>
               <span className="text-xs text-gray-400 font-medium">{listings.length} Listed</span>
             </div>
          </button>

          {/* Card 2: My Wins */}
          <button 
             onClick={() => setActiveTab('wins')}
             className={`bg-white p-5 rounded-3xl shadow-sm border transition-all duration-300 flex flex-col items-center justify-center gap-3 group ${activeTab === 'wins' ? 'ring-4 ring-yellow-500/20 border-yellow-500 scale-105 shadow-xl' : 'hover:shadow-md border-gray-100'}`}
          >
             <div className="w-14 h-14 bg-yellow-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition">
               <TrophyIcon />
             </div>
             <div className="text-center">
               <span className="block font-bold text-gray-800">Trophy Room</span>
               <span className="text-xs text-gray-400 font-medium">{wins.length} Won</span>
             </div>
          </button>

          {/* Card 3: Inbox Link */}
          <Link href="/inbox" className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col items-center justify-center gap-3 group">
             <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition relative">
               <InboxIcon />
               {unreadCount > 0 && <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></span>}
             </div>
             <div className="text-center">
               <span className="block font-bold text-gray-800">Messages</span>
               <span className="text-xs text-gray-400 font-medium">{unreadCount} New</span>
             </div>
          </Link>

          {/* Card 4: Post Item Shortcut */}
          <Link href="/post-item" className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col items-center justify-center gap-3 group">
             <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition text-3xl">
               ➕
             </div>
             <div className="text-center">
               <span className="block font-bold text-gray-800">Sell Car</span>
               <span className="text-xs text-gray-400 font-medium">Post New</span>
             </div>
          </Link>

        </div>

        {/* --- SECTION TITLE --- */}
        <div className="flex items-center justify-between mb-6">
           <h2 className="text-xl font-bold text-gray-900">
             {activeTab === 'selling' ? 'Active Listings' : 'Your Victories'}
           </h2>
           <span className="text-sm text-gray-400">View All</span>
        </div>

        {/* --- LISTINGS CONTENT --- */}
        {loading ? <p className="text-center py-10 opacity-50">Loading your data...</p> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {(activeTab === 'selling' ? listings : wins).map((item) => (
              <div key={item.id} className="bg-white rounded-3xl p-3 border border-gray-100 shadow-sm hover:shadow-lg transition-all group relative">
                
                {/* EDIT BUTTON (Only for Selling) */}
                {activeTab === 'selling' && (
                  <Link href={`/edit/${item.id}`}>
                    <button className="absolute top-4 right-4 bg-white/90 p-2 rounded-full text-emerald-600 shadow-lg z-10 hover:scale-110 transition">
                      ✏️
                    </button>
                  </Link>
                )}
                
                {/* DELETE BUTTON (Only for Selling) */}
                {activeTab === 'selling' && (
                    <button onClick={() => handleDelete(item.id)} className="absolute top-4 left-4 bg-white/90 p-2 rounded-full text-red-500 shadow-lg z-10 hover:scale-110 transition">
                      🗑️
                    </button>
                )}

                <Link href={`/listing/${item.id}`}>
                  <div className="cursor-pointer">
                    <div className="aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden relative mb-3">
                      {item.image_url ? <img src={item.image_url} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full text-gray-300">No Photo</div>}
                      
                      {activeTab === 'wins' && (
                         <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm">
                            <span className="bg-yellow-400 text-black font-extrabold px-4 py-2 rounded-full shadow-xl flex items-center gap-2">
                                🏆 WINNER
                            </span>
                         </div>
                      )}
                    </div>
                    
                    <div className="px-2 pb-2">
                      <h3 className="font-bold text-gray-900 truncate">{item.title}</h3>
                      <div className="flex justify-between items-center mt-1">
                         <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${item.type === 'raffle' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                           {item.type}
                         </span>
                         <span className="font-extrabold text-gray-900">
                           {item.type === 'raffle' ? `$${item.ticket_price}` : `$${item.price}`}
                         </span>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* RATE SELLER BUTTON (Wins Only) */}
                {activeTab === 'wins' && (
                    <button onClick={() => {setReviewItem(item); setShowReview(true);}} className="w-full mt-2 bg-gray-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-black transition">
                        ★ Rate Seller
                    </button>
                )}
              </div>
            ))}

            {(activeTab === 'selling' ? listings : wins).length === 0 && (
              <div className="col-span-full py-20 text-center">
                 <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-4 opacity-50">
                    {activeTab === 'selling' ? '🚗' : '🏆'}
                 </div>
                 <p className="text-gray-400 font-medium">Nothing to see here yet.</p>
              </div>
            )}

          </div>
        )}
      </main>

      {/* REVIEW MODAL (Unchanged Logic, Updated Style) */}
      {showReview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-[40px] w-full max-w-sm shadow-2xl animate-fade-in">
            <h3 className="text-2xl font-bold mb-2 text-center">Rate Seller</h3>
            <p className="text-center text-gray-500 mb-6 text-sm">How was your experience?</p>
            
            <div className="flex justify-center gap-2 mb-6">
                {[1,2,3,4,5].map(star => (
                  <button key={star} onClick={() => setRating(star)} className={`text-4xl transition hover:scale-110 ${rating >= star ? 'text-yellow-400' : 'text-gray-200'}`}>★</button>
                ))}
            </div>
            
            <textarea 
                placeholder="Write a quick review..." 
                className="w-full bg-gray-50 border-none rounded-2xl p-4 mb-4 focus:ring-2 focus:ring-emerald-500 outline-none resize-none h-32"
                value={comment} onChange={e=>setComment(e.target.value)}
            ></textarea>
            
            <div className="flex gap-3">
                <button onClick={() => setShowReview(false)} className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition">Cancel</button>
                <button className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-emerald-700 transition">Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}