{/* DYNAMIC SECTION: Show User Info OR Login button */}
{user ? (
  <div className="flex items-center gap-4 border-l pl-6 border-blue-700">
    
    {/* Inbox Link */}
    <Link href="/inbox" className="text-white hover:text-green-300 transition text-2xl relative" title="My Inbox">
      📬
    </Link>

    {/* PROFILE LINK (Clicking Name goes to Profile) */}
    <Link href="/profile" className="text-sm font-light hidden sm:block text-white hover:text-blue-200 hover:underline cursor-pointer">
      Hello, <span className="font-bold">{user.email}</span>
    </Link>

    <button 
      onClick={handleLogout} 
      className="text-sm bg-blue-800 hover:bg-blue-900 px-3 py-1 rounded transition text-white"
    >
      Logout
    </button>
  </div>
) : (
  <div className="flex items-center gap-4 border-l pl-6 border-blue-700">
    <Link href="/login" className="text-white hover:text-blue-200 transition font-medium">
      Log in
    </Link>
    <Link href="/signup" className="bg-white text-brand-blue px-4 py-2 rounded-full font-bold hover:bg-blue-50 transition shadow-md">
      Sign up
    </Link>
  </div>
)}