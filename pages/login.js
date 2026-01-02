import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    
    const data = await res.json();
    if (data.success) {
      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = '/'; // Hard refresh to update Navbar
    } else {
      alert(data.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-brand-blue mb-6">Welcome Back</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="email" placeholder="Email" 
            className="w-full p-3 border rounded"
            onChange={e => setForm({...form, email: e.target.value})}
          />
          <input 
            type="password" placeholder="Password" 
            className="w-full p-3 border rounded"
            onChange={e => setForm({...form, password: e.target.value})}
          />
          <button className="w-full bg-brand-blue text-white p-3 rounded font-bold hover:bg-blue-800">
            Log In
          </button>
        </form>
      </div>
    </div>
  );
}