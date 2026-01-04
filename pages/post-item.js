import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useRouter } from 'next/router';

export default function PostItem() {
  const router = useRouter();
  const [listingType, setListingType] = useState('auction'); // 'auction' or 'raffle'
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [user, setUser] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'autos',
    image_url: '', 
    // Auction specific
    price: '', 
    // Raffle specific
    ticket_price: '',
    total_tickets: ''
  });

  const categories = [
    { id: 'autos', label: '🚗 Autos & Vehicles' },
    { id: 'electronics', label: '📱 Phones & Electronics' },
    { id: 'fashion', label: '👟 Fashion & Sneakers' },
    { id: 'home', label: '🏠 Home & Garden' },
    { id: 'collectibles', label: '🃏 Collectibles' },
  ];

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
    else router.push('/login'); // Force login
  }, []);

  // --- 1. IMAGE COMPRESSION (No API needed) ---
  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 500; 
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.6)); 
        };
      };
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    try {
      const compressed = await compressImage(file);
      setFormData({ ...formData, image_url: compressed });
      setPreview(compressed);
    } catch (error) {
      alert("Image processing failed");
    }
    setUploading(false);
  };

  // --- 2. SUBMIT HANDLER ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert("You must be logged in.");

    const payload = {
      ...formData,
      user_email: user.email,
      type: listingType,
      // Logic: For raffle, 'price' (display price) equals ticket_price
      price: listingType === 'raffle' ? formData.ticket_price : formData.price,
      ticket_price: listingType === 'raffle' ? formData.ticket_price : 0,
      total_tickets: listingType === 'raffle' ? formData.total_tickets : 0,
      tickets_sold: 0,
      bid_count: 0
    };
    
    const res = await fetch('/api/create-listing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (data.success) {
      alert('Success! Item Posted.');
      router.push('/'); // Go to Home to see the new item
    } else {
      alert('Error posting item: ' + (data.error || 'Unknown error'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      <div className="max-w-2xl mx-auto p-6 bg-white shadow-xl rounded-xl mt-10">
        <h1 className="text-3xl font-bold mb-6 text-brand-blue">Sell an Item</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* PHOTO UPLOAD */}
          <div>
            <label className="block text-gray-700 font-bold mb-2">Item Photo</label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 relative overflow-hidden">
                {preview ? (
                  <img src={preview} className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> photo</p>
                    {uploading && <p className="text-blue-500 text-xs animate-pulse">Processing...</p>}
                  </div>
                )}
                <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
              </label>
            </div>
          </div>

          {/* TITLE */}
          <div>
            <label className="block font-semibold">Title</label>
            <input 
              type="text" 
              placeholder="e.g. 2018 Honda Civic" 
              className="w-full p-3 border rounded-lg"
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
          </div>

          {/* CATEGORY */}
          <div>
            <label className="block font-semibold mb-2">Category</label>
            <select 
              className="w-full p-3 border rounded-lg bg-white"
              onChange={(e) => setFormData({...formData, category: e.target.value})}
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
          </div>

          {/* --- TYPE SWITCHER --- */}
          <div className="bg-gray-100 p-4 rounded-xl">
            <label className="block font-bold mb-3">How do you want to sell this?</label>
            <div className="flex rounded-lg bg-white p-1 shadow-sm mb-4">
              <button type="button" onClick={() => setListingType('auction')} className={`flex-1 py-3 rounded-lg transition-all ${listingType === 'auction' ? 'bg-black text-white font-bold shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>🔨 Auction</button>
              <button type="button" onClick={() => setListingType('raffle')} className={`flex-1 py-3 rounded-lg transition-all ${listingType === 'raffle' ? 'bg-purple-600 text-white font-bold shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>🎟️ Raffle</button>
            </div>

            {/* CONDITIONAL INPUTS */}
            <div className="grid grid-cols-2 gap-4 animate-fadeIn">
              {listingType === 'auction' ? (
                <div className="col-span-2">
                  <label className="block font-semibold mb-2 text-sm text-gray-600">Starting Price ($)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 100"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-black outline-none"
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    required
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label className="block font-semibold mb-2 text-sm text-purple-800">Ticket Price ($)</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 10"
                      className="w-full p-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                      onChange={(e) => setFormData({...formData, ticket_price: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-2 text-sm text-purple-800">Total Tickets</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 50"
                      className="w-full p-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                      onChange={(e) => setFormData({...formData, total_tickets: e.target.value})}
                      required
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block font-semibold">Description</label>
            <textarea 
              rows="4" 
              className="w-full p-3 border rounded-lg"
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required
            ></textarea>
          </div>

          <button className={`w-full py-4 rounded-lg font-bold text-lg shadow-lg transition transform active:scale-95 ${listingType === 'raffle' ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-brand-blue hover:bg-blue-800 text-white'}`}>
            {listingType === 'raffle' ? '🎟️ Launch Raffle' : '🔨 Start Auction'}
          </button>
        </form>
      </div>
    </div>
  );
}