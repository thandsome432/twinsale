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
  
  // REVIEW MODAL STATE
  const [showReview, setShowReview] = useState(false);
  const [reviewItem, setReviewItem] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { router.push('/login'); return; }
    
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
    } catch (error) { console.error(error); }
    setLoading(false);
  };

  const openReviewModal = (item) => {
    setReviewItem(item);
    setShowReview(true);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reviewer_email: user.email,
        reviewed_email: reviewItem.user_email, // Seller's email
        listing_id: reviewItem.id,
        rating,
        comment
      })
    });
    const data = await res.json();
    if (data.success) {
      alert("✅ Review Submitted!");
      setShowReview(false);
      setComment('');
    } else {
      alert(data.error);
    }
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

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-5xl mx-auto p-6 mt-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm border mb-8 flex items-center gap-6">
          <div className="w-20 h-20 bg-brand-blue rounded-full flex items-center justify-center text-3xl font-bold text-white uppercase">{user.email[0]}</div>
          <div><h1 className="text-3xl font-bold text-gray-900">My Profile</h1><p className="text-gray-500">{user.email}</p></div>
        </div>

        <div className="flex gap-8 border-b mb-6">
           <button onClick={() => setActiveTab('selling')} className={`pb-2 font-bold text-lg transition ${activeTab === 'selling' ? 'border-b-4 border-black' : 'text-gray-400'}`}>Selling ({listings.length})</button>
           <button onClick={() => setActiveTab('wins')} className={`pb-2 font-bold text-lg transition ${activeTab === 'wins' ? 'border-b-4 border-yellow-500 text-yellow-600' : 'text-gray-400'}`}>🏆 My Wins ({wins.length})</button>
        </div>

        {loading ? <p>Loading...</p> : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {(activeTab === 'selling' ? listings : wins).map((item) => (
              <div key={item.id} className={`block group relative bg-white rounded-xl shadow-sm overflow-hidden border ${activeTab === 'wins' ? 'border-yellow-400' : ''}`}>
                
                {activeTab === 'selling' && (
                  <>
                    <Link href={`/edit/${item.id}`}><button className="absolute top-2 right-12 bg-white/90 p-2 rounded-full text-blue-500 hover:bg-blue-100 z-10">✏️</button></Link>
                    <button onClick={() => handleDelete(item.id)} className="absolute top-2 right-2 bg-white/90 p-2 rounded-full text-red-500 hover:bg-red-100 z-10">🗑️</button>
                  </>
                )}

                <Link href={`/listing/${item.id}`}>
                  <div className="cursor-pointer">
                    <div className="aspect-square bg-gray-200 relative">
                      {item.image_url ? <img src={item.image_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400">No Photo</div>}
                      {activeTab === 'wins' && <div className="absolute inset-0 bg-yellow-500/20 flex items-center justify-center"><span className="bg-yellow-500 text-white font-bold px-3 py-1 rounded shadow-lg">🏆 WINNER</span></div>}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg truncate">{item.title}</h3>
                      <p className="text-sm text-gray-500">{item.type === 'raffle' ? '🎟️ Raffle' : '🔨 Auction'}</p>
                    </div>
                  </div>
                </Link>

                {/* REVIEW BUTTON (Only in Wins Tab) */}
                {activeTab === 'wins' && (
                  <div className="p-4 pt-0">
                    <button onClick={() => openReviewModal(item)} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 rounded-lg text-sm">
                      ★ Rate Seller
                    </button>
                  </div>
                )}
              </div>
            ))}
            {(activeTab === 'selling' ? listings : wins).length === 0 && <div className="col-span-full text-center py-20 text-gray-400">Nothing here yet.</div>}
          </div>
        )}
      </main>

      {/* REVIEW MODAL */}
      {showReview && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-96">
            <h3 className="text-xl font-bold mb-4">Rate Your Experience</h3>
            <p className="text-sm text-gray-500 mb-4">How was the transaction with {reviewItem?.user_email}?</p>
            <form onSubmit={handleSubmitReview}>
              <div className="flex justify-center gap-2 mb-4">
                {[1,2,3,4,5].map(star => (
                  <button type="button" key={star} onClick={() => setRating(star)} className={`text-3xl ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}>★</button>
                ))}
              </div>
              <textarea placeholder="Write a comment..." className="w-full border p-2 rounded mb-4" rows="3" value={comment} onChange={e=>setComment(e.target.value)} required></textarea>
              <button className="w-full bg-black text-white py-3 rounded font-bold">Submit Review</button>
              <button type="button" onClick={() => setShowReview(false)} className="w-full mt-2 text-gray-500">Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}