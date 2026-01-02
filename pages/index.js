import Navbar from '../components/Navbar';
import db from '../db';
import Link from 'next/link';

export default function Home({ listings }) {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <div className="bg-gradient-to-br from-brand-blue to-blue-900 text-white pb-20 pt-16 rounded-b-[3rem] shadow-2xl relative overflow-hidden">
        
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-x-10 -translate-y-10"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-safe opacity-10 rounded-full blur-3xl translate-y-20"></div>

        <div className="max-w-6xl mx-auto px-4 text-center relative z-10">
          
          {/* THE LOGO PLACEHOLDER */}
          <div className="flex justify-center mb-6">
            <div className="bg-white p-4 rounded-full shadow-lg h-32 w-32 flex items-center justify-center text-6xl border-4 border-brand-safe">
              {/* REPLACE THIS EMOJI WITH YOUR IMAGE TAG LATER */}
              👫
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
            TwinSale<span className="text-brand-safe">.com</span>
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-2xl mx-auto font-light">
            The safest place to buy, bid, and win. Verified users, encrypted meetups, and real community.
          </p>
          
          <div className="flex flex-col md:flex-row justify-center gap-4">
            <Link href="/post-item" className="bg-brand-safe text-white px-10 py-4 rounded-full font-bold text-lg shadow-lg hover:bg-green-600 transform hover:scale-105 transition">
              Start Selling
            </Link>
            <Link href="/signup" className="bg-white text-brand-blue px-10 py-4 rounded-full font-bold text-lg shadow-lg hover:bg-gray-100 transform hover:scale-105 transition">
              Join Now
            </Link>
          </div>
        </div>
      </div>

      {/* --- LISTINGS GRID --- */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="flex justify-between items-end mb-10">
          <h2 className="text-3xl font-bold text-gray-800 border-l-8 border-brand-blue pl-4">
            Fresh Drops
          </h2>
          <span className="text-gray-500">Live in Dallas / Midland</span>
        </div>
        
        {listings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-inner">
            <p className="text-gray-400 text-xl">No items yet. Be the first!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {listings.map((item) => (
              <div key={item.id} className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
                {/* Image Placeholder */}
                <div className="h-48 bg-gray-200 flex items-center justify-center text-gray-400">
                  item photo
                </div>
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                     <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      item.type === 'raffle' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {item.type === 'raffle' ? '🎟️ Raffle' : '🔨 Auction'}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">#{item.id}</span>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2 text-gray-900 group-hover:text-brand-blue transition">{item.title}</h3>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">{item.description}</p>
                  
                  <Link href={`/listing/${item.id}`} className="block w-full text-center bg-gray-50 border border-gray-200 text-gray-700 font-bold py-3 rounded-xl hover:bg-brand-blue hover:text-white hover:border-transparent transition">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export async function getServerSideProps() {
  try {
    const result = await db.query("SELECT * FROM listings WHERE status = 'active' ORDER BY id DESC");
    return { props: { listings: result.rows } };
  } catch (error) {
    return { props: { listings: [] } };
  }
}