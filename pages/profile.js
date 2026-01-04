import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // 1. Check if logged in
    const stored = localStorage.getItem('user');
    if (!stored) {
      router.push('/login');
      return;
    }
    
    const userData = JSON.parse(stored);
    setUser(userData);

    // 2. Fetch my items
    fetchProfileData(userData.email);
  }, []);

  const fetchProfileData = async (email) => {
    try {
      const res = await fetch(`/api/my-profile?email=${email}`);
      const data = await res.json();
      if (data.listings) {
        setListings(data.listings);
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
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

        {/* MY LISTINGS */}
        <h2 className="text-2xl font-bold mb-4">My Listings ({listings.length})</h2>
        
        {loading ? (
          <p>Loading...</p>
        ) : listings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed">
            <p className="text-gray-400 mb-4">You haven't listed anything yet.</p>
            <Link href="/post-item" className="bg-black text-white px-6 py-2 rounded-lg font-bold">
              Start Selling
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {listings.map((item) => (
              <Link key={item.id} href={`/listing/${item.id}`} className="block group">
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition">
                  <div className="aspect-square bg-gray-200 relative">
                    {item.image_url ? (
                      <img src={item.image_url} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">No Photo</div>
                    )}
                    
                    {/* Status Badge */}
                    <div className={`absolute top-2 right-2 px-2 py-1 rounded text-[10px] font-bold uppercase text-white ${item.status === 'sold' ? 'bg-red-500' : 'bg-green-500'}`}>
                      {item.status === 'sold' ? 'SOLD' : 'ACTIVE'}
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-bold text-lg truncate">{item.title}</h3>
                    <p className="text-gray-500 text-sm mb-2">{item.type === 'raffle' ? '🎟️ Raffle' : '🔨 Auction'}</p>
                    <p className="font-bold text-brand-blue">
                      {item.type === 'raffle' ? `$${item.ticket_price}/ticket` : `$${item.price}`}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}