import { useState } from 'react';
import Navbar from '../components/Navbar';
import { useRouter } from 'next/router';

export default function PostItem() {
  const router = useRouter();
  const [listingType, setListingType] = useState('auction');
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    description: '',
    category: 'General', // Default
    image_url: '', // This will hold the photo link
  });

  const categories = [
    { id: 'autos', label: '🚗 Autos & Vehicles' },
    { id: 'electronics', label: '📱 Phones & Electronics' },
    { id: 'fashion', label: '👟 Fashion & Sneakers' },
    { id: 'home', label: '🏠 Home & Garden' },
    { id: 'collectibles', label: '🃏 Collectibles' },
  ];

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    const body = new FormData();
    body.append('file', file);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body });
      const data = await res.json();
      setFormData({ ...formData, image_url: data.url });
      setPreview(data.url); // Show the image on screen
    } catch (error) {
      alert("Image upload failed");
    }
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/create-listing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, type: listingType }),
    });

    const data = await res.json();
    if (data.success) {
      alert('Success! Item Posted.');
      router.push('/');
    } else {
      alert('Error posting item');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      <div className="max-w-2xl mx-auto p-6 bg-white shadow-xl rounded-xl mt-10">
        <h1 className="text-3xl font-bold mb-6 text-brand-blue">Sell an Item</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* 1. PHOTO UPLOAD SECTION */}
          <div>
            <label className="block text-gray-700 font-bold mb-2">Item Photo</label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                {preview ? (
                  <img src={preview} className="h-full w-full object-cover rounded-lg" />
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> main photo</p>
                    <p className="text-xs text-gray-500">SVG, PNG, JPG</p>
                  </div>
                )}
                <input type="file" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>
            {uploading && <p className="text-blue-500 text-sm mt-2">Uploading image...</p>}
          </div>

          {/* 2. TITLE */}
          <div>
            <label className="block font-semibold">Title</label>
            <input 
              type="text" 
              placeholder="e.g. 2018 Honda Civic" 
              className="w-full p-3 border rounded-lg"
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>

          {/* 3. CATEGORY DROPDOWN */}
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

          {/* 4. TYPE & PRICE */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-2">Type</label>
              <div className="flex rounded-lg bg-gray-200 p-1">
                <button type="button" onClick={() => setListingType('auction')} className={`flex-1 py-2 rounded ${listingType === 'auction' ? 'bg-white shadow text-blue-700 font-bold' : 'text-gray-500'}`}>Auction</button>
                <button type="button" onClick={() => setListingType('raffle')} className={`flex-1 py-2 rounded ${listingType === 'raffle' ? 'bg-white shadow text-purple-700 font-bold' : 'text-gray-500'}`}>Raffle</button>
              </div>
            </div>
            <div>
              <label className="block font-semibold mb-2">Price ($)</label>
              <input 
                type="number" 
                className="w-full p-3 border rounded-lg"
                onChange={(e) => setFormData({...formData, price: e.target.value})}
              />
            </div>
          </div>

          {/* 5. DESCRIPTION */}
          <div>
            <label className="block font-semibold">Description</label>
            <textarea 
              rows="4" 
              className="w-full p-3 border rounded-lg"
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            ></textarea>
          </div>

          <button className="w-full bg-brand-blue text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-800 transition">
            Post Listing
          </button>
        </form>
      </div>
    </div>
  );
}