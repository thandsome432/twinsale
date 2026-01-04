import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      
      const data = await res.json();

      if (data.success) {
        // FIX: We manually add the email from the form to ensure it gets saved
        const userToSave = { 
          ...data.user, 
          email: form.email // This guarantees "Hello, [email]" works!
        };

        localStorage.setItem('user', JSON.stringify(userToSave));
        
        // Force a hard refresh so the Navbar updates immediately
        window.location.href = '/'; 
      } else {
        alert(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('An unexpected error occurred.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-brand-blue mb-6">Welcome Back</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="email" 
            placeholder="Email" 
            className="w-full p-3 border rounded"
            onChange={e => setForm({...form, email: e.target.value})}
            value={form.email}
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="w-full p-3 border rounded"
            onChange={e => setForm({...form, password: e.target.value})}
            value={form.password}
          />
          <button className="w-full bg-brand-blue text-white p-3 rounded font-bold hover:bg-blue-800 transition">
            Log In
          </button>
        </form>
      </div>
    </div>
  );
}