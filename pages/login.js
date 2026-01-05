import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Navbar from '../components/Navbar';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      
      if (res.ok) {
        // Save user & redirect
        localStorage.setItem('user', JSON.stringify(data.user));
        router.push('/'); 
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert('Login failed.');
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
              Welcome <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600">Back.</span>
            </h1>
            <p className="text-gray-500 text-sm">Sign in to continue your journey.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
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
                placeholder="Password"
                className="w-full px-6 py-4 rounded-full bg-white/50 border border-transparent focus:bg-white focus:ring-4 focus:ring-orange-100 focus:border-orange-300 outline-none transition-all shadow-inner text-lg"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required 
              />
            </div>

            {/* LOG IN BUTTON */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-black text-white font-bold text-lg py-4 rounded-full shadow-xl hover:scale-105 hover:bg-gray-900 transition-transform duration-200"
            >
              {loading ? "Unlocking..." : "Log In"}
            </button>
          </form>

          {/* FOOTER LINKS */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Don't have an account? <Link href="/signup" className="font-bold text-orange-600 hover:underline">Join Now</Link></p>
          </div>

        </div>
      </div>
    </div>
  );
}