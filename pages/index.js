import Navbar from '../components/Navbar';
import db from '../db';
import Link from 'next/link';

export default function Home({ listings }) {
  // Categories like FB Marketplace
  const categories = [
    { name: "Vehicles", icon: "🚗" },
    { name: "Property", icon: "🏠" },
    { name: "Apparel", icon: "👕" },
    { name: "Electronics", icon: "📱" },
    { name: "Entertainment", icon: "🎮" },
    { name: "Family", icon: "🧸" },
    { name: "Free Stuff", icon: "🎁" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="max-w-[1920px] mx-auto flex pt-4">
        
        {/* --- LEFT SIDEBAR (Desktop Only) --- */}
        <aside className="hidden lg:block w-80 p-4 sticky top-4 h-screen overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Marketplace</h2>
            <Link href="/post-item" className="bg-blue-100 text-blue-600 px-4 py-2 rounded-full text-sm font-bold hover:bg-blue-200">
              + Create New
            </Link>
          </div>

          <div className="space-y-1">
            <button className="w-full flex items-center p-3 bg-gray-100 rounded-lg font-semibold text-left">
              <span className="bg-blue-500 text-white p-2 rounded-full mr-3 text-sm">🏪</span>
              Browse all
            </button>
            {/* Sidebar Categories */}
            {categories.map((cat) => (
              <button key={cat.name} className="w-full flex items-center p-3 hover:bg-gray-100 rounded-lg font-medium text-gray-700 text-left transition">
                <span className="bg-gray-200 p-2 rounded-full mr-3 text-sm">{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </div>
          
          <div className="mt-8 border-t pt-6">
            <h3 className="font-semibold text-gray-900 mb-2">Filters</h3>
            <p className="text-blue-600 text-sm cursor-pointer hover:underline">Odessa, TX · Within 65 miles</p>
          </div>
        </aside>

        {/* --- MAIN FEED (Right Side) --- */}
        <div className="flex-1 p-4">
          
          {/* Mobile Categories (Horizontal Scroll) */}
          <div className="lg:hidden flex overflow-x-auto space-x-3 pb-4 mb-4 scrollbar-hide">
            <Link href="/post-item" className="flex-shrink-0 bg-gray-100 px-5 py-2 rounded-full font-bold text-sm whitespace-nowrap">
              🖊️ Sell
            </Link>
            {categories.map((cat) => (
               <button key={cat.name} className="flex-shrink-0 bg-gray-100 px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap hover:bg-gray-200">
                 {cat.name}
               </button>
            ))}
          </div>

          <div className="mb-4 flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-900">Today's Picks</h3>
            <span className="text-blue-600 text-sm cursor-pointer hover:underline lg:hidden">Dallas · 40mi</span>
          </div>

          {/* --- THE GRID --- */}
          {listings.length === 0 ? (
            <div className="text-center py-32 bg-gray-50 rounded-xl">
              <p className="text-gray-400 text-xl">No items found in this area.</p>
              <Link href="/post-item" className="text-blue-600 font-bold hover:underline mt-2 inline-block">
                Be the first to sell something!
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {listings.map((item) => (
                <Link key={item.id} href={`/listing/${item.id}`} className="group cursor-pointer">
                  
                  {/* Image Card */}
                  <div className="aspect-square w-full bg-gray-200 rounded-lg overflow-hidden relative mb-2">
                    {item.image_url ? (
                      <img 
                        src={item.image_url} 
                        alt={item.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <span>No Photo</span>
                      </div>
                    )}
                    {/* Type Badge */}
                     <div className={`absolute bottom-2 left-2 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide text-white shadow-sm ${
                        item.type === 'raffle' ? 'bg-purple-600' : 'bg-black/70'
                      }`}>
                        {item.type}
                      </div>
                  </div>

                  {/* Text Details */}
                  <div>
                    <div className="font-bold text-gray-900 text-lg">
                      ${Number(item.price).toLocaleString()}
                    </div>
                    <div className="text-gray-900 font-medium text-base truncate leading-snug">
                      {item.title}
                    </div>
                    <div className="text-gray-500 text-sm truncate">
                      Odessa, TX
                    </div>
                  </div>

                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export async function getServerSideProps() {
  try {
    // FIX: Only fetch items where status is 'active'
    const result = await db.query("SELECT * FROM listings WHERE status = 'active' ORDER BY id DESC");
    const listings = JSON.parse(JSON.stringify(result.rows));

    return { props: { listings } };
  } catch (error) {
    console.error("Database Error:", error);
    return { props: { listings: [] } };
  }
}