import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [unreadCount, setUnreadCount] = useState(0); // NEW: Track unread messages
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      
      // 1. Check immediately
      checkUnread(userData.email);

      // 2. Check every 5 seconds (Live Notifications!)
      const interval = setInterval(() => checkUnread(userData.email), 5000);
      return () => clearInterval(interval);
    }
  }, []);

  const checkUnread = async (email) => {
    try {
      const res = await fetch(`/api/unread-count?email=${email}`);
      const data = await res.json();
      setUnreadCount(data.count);
    } catch (e) {
      console.error("Failed to check messages");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <nav className="bg-brand-blue p-4 shadow-md sticky top-0 z-50">
      <div className="max-w-[1920px] mx-auto flex justify-between items-center">
        
        {/* LOGO */}
        <Link href="/" className="text-white text-2xl font-extrabold tracking-tight flex items-center gap-2">
          TwinSale <span className="text-green-400">.com</span>
        </Link>

        {/* SEARCH BAR */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 mx-8 max-w-2xl">
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for cars, phones, clothes..." 
            className="w-full px-4 py-2 rounded-l-full border-none focus:ring-2 focus:ring-green-400 outline-none"
          />
          <button type="submit" className="bg-green-500 text-white px-6 rounded-r-full hover:bg-green-600 transition font-bold">
            🔍
          </button>
        </form>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-4">
          
          <Link href="/" className="text-white font-bold hover:text-green-300 transition hidden sm:block">
            Marketplace
          </Link>

          <Link href="/post-item" className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full font-bold transition shadow-lg flex items-center gap-2">
            + Sell Item
          </Link>

          {user ? (
            <div className="flex items-center gap-4 border-l pl-6 border-blue-700">
              
              {/* INBOX WITH BADGE */}
              <Link href="/inbox" className="text-white hover:text-green-300 transition text-2xl relative" title="My Inbox">
                📬
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-white animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </Link>

              <Link href="/profile" className="text-sm font-light hidden sm:block text-white hover:text-blue-200 hover:underline cursor-pointer">
                Hello, <span className="font-bold">{user.email}</span>
              </Link>
              <button onClick={handleLogout} className="text-sm bg-blue-800 hover:bg-blue-900 px-3 py-1 rounded transition text-white">Logout</button>
            </div>
          ) : (
            <div className="flex items-center gap-4 border-l pl-6 border-blue-700">
              <Link href="/login" className="text-white hover:text-blue-200 transition font-medium">Log in</Link>
              <Link href="/signup" className="bg-white text-brand-blue px-4 py-2 rounded-full font-bold hover:bg-blue-50 transition shadow-md">Sign up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}