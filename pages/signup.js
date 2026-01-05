import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Navbar from '../components/Navbar';

export default function Signup() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      
      if (res.ok) {
        // Automatically log them in (store user) and go to home
        localStorage.setItem('user', JSON.stringify(data.user));
        router.push('/');
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert('Signup failed.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* CENTERING CONTAINER */}
      <div className="min-h-screen flex items-center justify-center p-6 pt-32">
        
        {/* GLASS CARD */}
        <div className="w-full max-w-md bg-white/70 backdrop-blur-2xl p-10 rounded-[40px] shadow-2xl border border-white animate-fade-in">
          
          <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold tracking-tight mb-2">
              Join <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600">TwinSale.</span>
            </h1>
            <p className="text-gray-500 text-sm">Start buying, selling, and winning today.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* USERNAME INPUT */}
            <div>
              <input 
                type="text" 
                placeholder="Username"
                className="w-full px-6 py-4 rounded-full bg-white/50 border border-transparent focus:bg-white focus:ring-4 focus:ring-orange-100 focus:border-orange-300 outline-none transition-all shadow-inner text-lg"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                required 
              />
            </div>

            {/* EMAIL INPUT */}
            <div>
              <input 
                type="email" 
                placeholder="name@example.com"
                className="w-full px-6 py-4 rounded-full bg-white/50 border border-transparent focus:bg-white focus:ring-4 focus:ring-orange-100 focus:border-orange-300 outline-none transition-all shadow-inner text-lg"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required 
              />
            </div>

            {/* PASSWORD INPUT */}
            <div>
              <input 
                type="password" 
                placeholder="Create a Password"
                className="w-full px-6 py-4 rounded-full bg-white/50 border border-transparent focus:bg-white focus:ring-4 focus:ring-orange-100 focus:border-orange-300 outline-none transition-all shadow-inner text-lg"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required 
              />
            </div>

            {/* SIGN UP BUTTON */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-black text-white font-bold text-lg py-4 rounded-full shadow-xl hover:scale-105 hover:bg-gray-900 transition-transform duration-200 mt-4"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          {/* FOOTER LINKS */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Already have an account? <Link href="/login" className="font-bold text-orange-600 hover:underline">Log In</Link></p>
          </div>

        </div>
      </div>
    </div>
  );
}