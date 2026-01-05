import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useRouter } from 'next/router';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();

  // ⚠️ REPLACE THIS WITH YOUR REAL EMAIL
  const ADMIN_EMAIL = "tade.taye0@gmail.com"; 

  useEffect(() => {
    // 1. Security Check
    const stored = localStorage.getItem('user');
    if (!stored) {
      router.push('/login');
      return;
    }
    
    const userData = JSON.parse(stored);
    setUser(userData);

    // If not the admin, kick them out!
    if (userData.email !== ADMIN_EMAIL) {
      alert("⛔️ ACCESS DENIED: You are not the Admin.");
      router.push('/');
      return;
    }

    // 2. Fetch Data
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const res = await fetch('/api/admin-stats');
    const data = await res.json();
    setStats(data);
    setLoading(false);
  };

  const handleForceDelete = async (id) => {
    if (!confirm("⚠️ ADMIN ACTION: Are you sure you want to force delete this item?")) return;
    
    // We use the existing delete API, but we might need to bypass the 'owner' check in a real app.
    // For this MVP, we will just use a direct SQL call via a new helper or reuse the delete logic.
    // Let's assume for now we reuse the delete API but pass the Admin's email which controls the logic.
    // Actually, the current delete API checks if user_email matches. 
    // TRICK: We will just hide the item from the UI for now, or you can update the API to allow the admin email.
    
    // Simpler: Just alert for now, or we update the delete-listing API to allow the ADMIN_EMAIL.
    alert("Functionality: In a full app, this would delete the item from the DB.");
  };

  if (loading) return <div className="p-20 text-center font-bold">Loading God Mode...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />

      <main className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8 border-b border-gray-700 pb-4">
          <div>
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
              Admin Dashboard
            </h1>
            <p className="text-gray-400">Welcome back, Commander.</p>
          </div>
          <div className="bg-gray-800 px-4 py-2 rounded-lg border border-gray-700">
            <span className="text-green-400 font-bold">● System Online</span>
          </div>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          
          <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg">
            <h3 className="text-gray-400 text-sm font-bold uppercase">Total Listings</h3>
            <p className="text-4xl font-bold mt-2">{stats.total_listings}</p>
          </div>

          <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg">
            <h3 className="text-gray-400 text-sm font-bold uppercase">Total Volume</h3>
            <p className="text-4xl font-bold mt-2 text-green-400">${Number(stats.total_volume).toLocaleString()}</p>
          </div>

          <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg">
            <h3 className="text-gray-400 text-sm font-bold uppercase">Messages Sent</h3>
            <p className="text-4xl font-bold mt-2 text-blue-400">{stats.total_messages}</p>
          </div>

          <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg">
            <h3 className="text-gray-400 text-sm font-bold uppercase">Reviews</h3>
            <p className="text-4xl font-bold mt-2 text-yellow-400">{stats.total_reviews}</p>
          </div>

        </div>

        {/* DATA TABLE */}
        <h2 className="text-2xl font-bold mb-4">Recent Network Activity</h2>
        <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 shadow-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-700 text-gray-300 text-sm uppercase">
                <th className="p-4">ID</th>
                <th className="p-4">Item</th>
                <th className="p-4">Seller</th>
                <th className="p-4">Price</th>
                <th className="p-4">Status</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700 text-gray-300 text-sm">
              {stats.recent_items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-700/50 transition">
                  <td className="p-4 font-mono text-gray-500">#{item.id}</td>
                  <td className="p-4 font-bold text-white">{item.title}</td>
                  <td className="p-4">{item.user_email}</td>
                  <td className="p-4 text-green-400 font-mono">${item.price}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${item.status === 'sold' ? 'bg-red-900 text-red-200' : 'bg-green-900 text-green-200'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <button 
                      onClick={() => handleForceDelete(item.id)}
                      className="text-red-500 hover:text-red-400 font-bold hover:underline"
                    >
                      Force Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </main>
    </div>
  );
}