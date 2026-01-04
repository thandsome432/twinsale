import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  // Check for logged-in user when the page loads
  useEffect(() => {
    // We try to read the 'user' data from the browser's storage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    // Remove user data and send them to login page
    localStorage.removeItem('user');
    localStorage.removeItem('token'); 
    setUser(null);
    router.push('/login');
  };

  return (
    <nav className="bg-brand-blue p-4 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold tracking-wider flex items-center gap-2">
          TwinSale<span className="text-brand-safe">.com</span>
        </Link>

        {/* Links */}
        <div className="flex items-center space-x-6 font-semibold">
          <Link href="/" className="hover:text-gray-300">Marketplace</Link>
          
          <Link href="/post-item" className="bg-brand-safe px-4 py-2 rounded hover:bg-green-600 transition shadow-md">
            + Sell Item
          </Link>

          {/* DYNAMIC SECTION: Show User Info OR Login button */}
          {user ? (
            <div className="flex items-center gap-4 border-l pl-6 border-blue-700">
              <span className="text-sm font-light hidden sm:block">
                Hello, <span className="font-bold">{user.email || 'User'}</span>
              </span>
              <button 
                onClick={handleLogout} 
                className="text-sm bg-blue-800 hover:bg-blue-900 px-3 py-1 rounded transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link href="/login" className="hover:text-gray-300">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
}