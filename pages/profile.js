import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [wins, setWins] = useState([]);
  const [activeTab, setActiveTab] = useState('selling'); 
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) {
      router.push('/login');
      return;
    }
    
    const userData = JSON.parse(stored);
    setUser(userData);
    fetchProfileData(userData.email);
  }, []);

  const fetchProfileData = async (email) => {
    try {
      const res = await fetch(`/api/my-profile?email=${email}`);
      const data = await res.json();
      if (data.listings) setListings(data.listings);
      if (data.wins) setWins(data.wins);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const handleDelete = async (listingId) => {
    if (!confirm("Are you sure you want to delete this item? This cannot be undone.")) return;

    try {
      const res = await fetch('/api/delete-listing', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listing_id: listingId, user_email: user.email }),
      });

      const data = await res.json();

      if (data.success) {
        setListings(listings.filter(item => item.id !== listingId));
        alert("Item deleted.");
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert("Failed to delete.");
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-5xl mx-auto p-6 mt-6">
        {/* HEADER */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border mb-8 flex items-center gap-6">
          <div className="w-20 h-20 bg-brand-blue rounded-full flex items-center justify-center text-3xl font-bold text-white uppercase">
            {user.email[0]}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-500">{user.email}</p>
          </div>
        </div>

        {/* TABS */}
        <div className="flex gap-8 border-b mb-6">
           <button 
             onClick={() => setActiveTab('selling')} 
             className={`pb-2 font-bold text-lg transition ${activeTab === 'selling' ? 'border-b-4 border-black text-black' : 'text-gray-400 hover:text-gray-600'}`}
           >
             Selling ({listings.length})
           </button>
           <button 
             onClick={() => setActiveTab('wins')} 
             className={`pb-2 font-bold text-lg transition ${activeTab === 'wins' ? 'border-b-4 border-yellow-500 text-yellow-600' : 'text-gray-400 hover:text-gray-600'}`}
           >
             🏆 My Wins ({wins.length})
           </button>
        </div>

        {/* CONTENT AREA */}
        {loading ? <p>Loading...</p> : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            
            {/* LOGIC: Show either Listings or Wins */}
            {(activeTab === 'selling' ? listings : wins).map((item) => (
              <div key={item.id} className={`block group relative bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition ${activeTab === 'wins' ? 'border-2 border-yellow-400' : 'border'}`}>
                
                {/* --- SELLER TOOLS (Only on Selling Tab) --- */}
                {activeTab === 'selling' && (
                  <>
                    {/* EDIT BUTTON (Pencil) */}
                    <Link href={`/edit/${item.id}`}>
                        <button 
                        className="absolute top-2 right-12 bg-white/90 p-2 rounded-full shadow-md text-blue-500 hover:bg-blue-100 z-10 transition hover:scale-110"
                        title="Edit Item"
                        >
                        ✏️
                        </button>
                    </Link>

                    {/* DELETE BUTTON (Trash) */}
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="absolute top-2 right-2 bg-white/90 p-2 rounded-full shadow-md text-red-500 hover:bg-red-100 z-10 transition hover:scale-110"
                      title="Delete Item"
                    >
                      🗑️
                    </button>
                  </>
                )}

                <Link href={`/listing/${item.id}`}>
                  <div className="cursor-pointer">
                    <div className="aspect-square bg-gray-200 relative">
                      {item.image_url ? <img src={item.image_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400">No Photo</div>}
                      
                      {activeTab === 'wins' && (
                         <div className="absolute inset-0 bg-yellow-500/20 flex items-center justify-center">
                            <span className="bg-yellow-500 text-white font-bold px-3 py-1 rounded shadow-lg">🏆 WINNER</span>
                         </div>
                      )}

                       {/* Status Badge (if selling) */}
                       {activeTab === 'selling' && (
                        <div className={`absolute bottom-2 left-2 px-2 py-1 rounded text-[10px] font-bold uppercase text-white ${item.status === 'sold' ? 'bg-red-500' : 'bg-green-500'}`}>
                            {item.status === 'sold' ? 'SOLD' : 'ACTIVE'}
                        </div>
                       )}
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-bold text-lg truncate">{item.title}</h3>
                      <p className="text-sm text-gray-500">{item.type === 'raffle' ? '🎟️ Raffle' : '🔨 Auction'}</p>
                      <p className="font-bold text-brand-blue mt-1">
                        {item.type === 'raffle' ? `$${item.ticket_price}/ticket` : `$${item.price}`}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            ))}

            {/* Empty State */}
            {(activeTab === 'selling' ? listings : wins).length === 0 && (
              <div className="col-span-full text-center py-20 text-gray-400 bg-white rounded-xl border border-dashed">
                {activeTab === 'selling' ? (
                    <div>
                        <p className="mb-4">You aren't selling anything yet.</p>
                        <Link href="/post-item" className="bg-black text-white px-6 py-2 rounded-lg font-bold">Start Selling</Link>
                    </div>
                ) : (
                    <p>No wins yet. Go enter a raffle!</p>
                )}
              </div>
            )}

          </div>
        )}
      </main>
    </div>
  );
}