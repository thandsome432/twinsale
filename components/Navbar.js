import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-brand-blue p-4 text-white shadow-lg">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold tracking-wider">
          TwinSale<span className="text-brand-safe">.com</span>
        </Link>

        {/* Links */}
        <div className="space-x-6 font-semibold">
          <Link href="/" className="hover:text-gray-300">Marketplace</Link>
          <Link href="/post-item" className="bg-brand-safe px-4 py-2 rounded hover:bg-green-600 transition">
            + Sell Item
          </Link>
          <Link href="/login" className="hover:text-gray-300">Login</Link>
        </div>
      </div>
    </nav>
  );
}