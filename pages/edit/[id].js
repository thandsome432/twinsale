import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { useRouter } from 'next/router';
import db from '../../db'; // Import DB for server-side

export default function EditListing({ initialData }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  
  // PRE-FILL FORM WITH DATABASE DATA
  const [formData, setFormData] = useState({
    title: initialData.title,
    description: initialData.description,
    price: initialData.price,
  });

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) {
       router.push('/login'); 
    } else {
       const userData = JSON.parse(stored);
       setUser(userData);
       // Security: If current user isn't the owner, kick them out
       if (userData.email !== initialData.user_email) {
         alert("You don't own this item!");
         router.push('/');
       }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/edit-listing', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        ...formData, 
        id: initialData.id, 
        user_email: user.email 
      }),
    });

    const data = await res.json();
    if (data.success) {
      alert("✅ Saved!");
      router.push('/profile');
    } else {
      alert(data.error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      <div className="max-w-2xl mx-auto p-6 bg-white shadow-xl rounded-xl mt-10">
        <h1 className="text-3xl font-bold mb-6 text-brand-blue">Edit Listing</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label className="block font-semibold">Title</label>
            <input 
              type="text" 
              value={formData.title}
              className="w-full p-3 border rounded-lg"
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div>
            <label className="block font-semibold">Price ($)</label>
            <input 
              type="number" 
              value={formData.price}
              className="w-full p-3 border rounded-lg"
              onChange={(e) => setFormData({...formData, price: e.target.value})}
            />
          </div>

          <div>
            <label className="block font-semibold">Description</label>
            <textarea 
              rows="4" 
              value={formData.description}
              className="w-full p-3 border rounded-lg"
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            ></textarea>
          </div>

          <button className="w-full bg-black text-white py-4 rounded-lg font-bold text-lg hover:bg-gray-800 transition">
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}

export async function getServerSideProps(context) {
  const { id } = context.params;
  const res = await db.query("SELECT * FROM listings WHERE id = $1", [id]);
  
  if (res.rows.length === 0) return { notFound: true };

  return {
    props: {
      initialData: JSON.parse(JSON.stringify(res.rows[0]))
    }
  };
}