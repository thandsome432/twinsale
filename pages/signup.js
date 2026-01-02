import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Signup() {
  const router = useRouter();
  const [form, setForm] = useState({ username: '', email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    
    const data = await res.json();
    if (data.success) {
      // Save user to browser storage (simple login)
      localStorage.setItem('user', JSON.stringify(data.user));
      alert('Welcome to TwinSale!');
      router.push('/');
    } else {
      alert(data.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-brand-blue mb-6">Join TwinSale</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            placeholder="Username" 
            className="w-full p-3 border rounded"
            onChange={e => setForm({...form, username: e.target.value})}
          />
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
            Sign Up
          </button>
        </form>
        <p className="text-center mt-4">
          Already have an account? <Link href="/login" className="text-blue-600 font-bold">Log In</Link>
        </p>
      </div>
    </div>
  );
}