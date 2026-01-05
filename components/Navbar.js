import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    // Safer LocalStorage Check
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        checkUnread(userData.email);
      }
    } catch (err) {
      console.error("User data error", err);
      // If data is corrupt, clear it so the app doesn't crash loop
      localStorage.removeItem('user');
    }
  }, []);

  const checkUnread = async (email) => {
    if (!email) return;
    try {
      const res = await fetch(`/api/unread-count?email=${email}`);
      const data = await res.json();
      setUnreadCount(data.count || 0);
    } catch (e) {
      // Ignore errors silently
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  // Safe Avatar Helper
  const getAvatarLetter = () => {
    if (user && user.email) return user.email[0].toUpperCase();
    if (user && user.username) return user.username[0].toUpperCase();
    return "U"; // Default if missing
  };

  return (
    <div className="fixed top-6 left-0 right-0 flex justify-center z-50 px-4">
      <nav className="bg-white/70 backdrop-blur-xl border border-white/40 shadow-xl rounded-full px-6 py-3 flex items-center justify-between w-full max-w-5xl transition-all hover:bg-white/90">
        
        {/* LOGO */}
        <Link href="/" className="text-xl font-bold tracking-tight flex items-center gap-1 text-gray-900 mr-4">
          Twin<span className="text-orange-500">Sale</span>
        </Link>

        {/* CENTER LINKS (HIDDEN IF LOGGED OUT) */}
        {user && (
          <div className="hidden md:flex gap-6 text-sm font-medium text-gray-600">
            <Link href="/" className="hover:text-black transition">Marketplace</Link>
            <Link href="/profile" className="hover:text-black transition">My Wins</Link>
          </div>
        )}

        {/* RIGHT SIDE ACTIONS */}
        <div className="flex items-center gap-3">
          
          {user ? (
             <Link href="/post-item" className="hidden sm:flex bg-black text-white px-5 py-2 rounded-full text-sm font-bold shadow-lg hover:scale-105 transition transform">
               + Sell
             </Link>
          ) : null}

          {user ? (
            <div className="flex items-center gap-3 pl-3 border-l border-gray-300">
              
              {/* Inbox Bubble */}
              <Link href="/inbox" className="relative p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition">
                📬
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white">
                    {unreadCount}
                  </span>
                )}
              </Link>
              
              {/* User Avatar (CRASH PROOF VERSION) */}
              <Link href="/profile">
                <div className="w-9 h-9 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-orange-400">
                  {getAvatarLetter()}
                </div>
              </Link>
              
              {/* Logout */}
              <button onClick={handleLogout} className="text-gray-400 hover:text-black text-xs font-bold ml-2">
                ✕
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="px-5 py-2 rounded-full font-bold text-sm text-gray-700 hover:bg-gray-100 transition">
                Log In
              </Link>
              <Link href="/signup" className="bg-orange-500 text-white px-5 py-2 rounded-full text-sm font-bold shadow-md hover:bg-orange-600 transition">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}