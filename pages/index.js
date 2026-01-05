import Navbar from '../components/Navbar';
import db from '../db';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Home({ listings }) {
  const router = useRouter();
  const currentCategory = router.query.category || 'all';

  const categories = [
    { id: 'autos', name: "Vehicles", icon: "🚗" },
    { id: 'electronics', name: "Tech", icon: "📱" },
    { id: 'fashion', name: "Style", icon: "👕" },
    { id: 'home', name: "Living", icon: "🏠" },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* 1. HERO SECTION (Padding Top compensates for floating navbar) */}
      <div className="pt-32 pb-12 px-6 text-center max-w-4xl mx-auto animate-fade-in">
        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-4">
          Prepare for <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600">Anything.</span>
        </h1>
        <p className="text-xl text-gray-500 mb-8 max-w-2xl mx-auto">
          The next-generation marketplace. Buy, sell, and win with verified safety.
        </p>
        
        {/* Search Bubble */}
        <form action="/" className="relative max-w-lg mx-auto">
          <input 
            name="search"
            type="text" 
            placeholder="Search for cars, phones..." 
            className="w-full pl-6 pr-14 py-4 rounded-full border-none shadow-xl bg-white/80 backdrop-blur-md focus:ring-4 focus:ring-orange-100 outline-none text-lg"
          />
          <button className="absolute right-2 top-2 bg-black text-white w-10 h-10 rounded-full flex items-center justify-center font-bold">
            🔍
          </button>
        </form>
      </div>

      <main className="max-w-7xl mx-auto px-6 pb-20">
        
        {/* 2. CATEGORY PILLS (Horizontal Scroll) */}
        <div className="flex justify-center gap-3 mb-12 overflow-x-auto pb-4 scrollbar-hide">
            <Link href="/" className={`px-6 py-3 rounded-full font-bold text-sm shadow-sm transition ${currentCategory === 'all' ? 'bg-black text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
              All
            </Link>
            {categories.map((cat) => (
              <Link key={cat.id} href={`/?category=${cat.id}`} className={`px-6 py-3 rounded-full font-bold text-sm shadow-sm whitespace-nowrap transition ${currentCategory === cat.id ? 'bg-black text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                {cat.icon} {cat.name}
              </Link>
            ))}
        </div>

        {/* 3. THE "BEAUTIFUL" GRID */}
        {listings.length === 0 ? (
          <div className="text-center py-20 opacity-50">No items found.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {listings.map((item) => (
              <Link key={item.id} href={`/listing/${item.id}`} className="group relative">
                
                {/* CARD CONTAINER */}
                <div className="bg-white rounded-3xl p-3 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 h-full">
                  
                  {/* IMAGE */}
                  <div className="aspect-[4/5] w-full bg-gray-100 rounded-2xl overflow-hidden relative mb-3">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-300">No Photo</div>
                    )}
                    
                    {/* Floating Badge */}
                    <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide text-white shadow-lg backdrop-blur-md ${item.type === 'raffle' ? 'bg-purple-600/90' : 'bg-black/70'}`}>
                      {item.type === 'raffle' ? '🎟️ Raffle' : 'Auction'}
                    </div>
                  </div>

                  {/* DETAILS */}
                  <div className="px-1">
                    <div className="flex justify-between items-end">
                       <div>
                         <h3 className="font-bold text-gray-900 truncate pr-2">{item.title}</h3>
                         <p className="text-xs text-gray-400">Odessa, TX</p>
                       </div>
                       <div className="text-right">
                         <p className="font-extrabold text-lg text-gray-900">
                           {item.type === 'raffle' ? `$${item.ticket_price}` : `$${Number(item.price).toLocaleString()}`}
                         </p>
                       </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export async function getServerSideProps(context) {
  const { category, search } = context.query;
  try {
    let queryText = "SELECT * FROM listings WHERE status = 'active'";
    let queryParams = [];
    let paramCount = 1;
    if (category && category !== 'all') {
      queryText += ` AND category = $${paramCount}`;
      queryParams.push(category);
      paramCount++;
    }
    if (search) {
      queryText += ` AND title ILIKE $${paramCount}`;
      queryParams.push(`%${search}%`);
      paramCount++;
    }
    queryText += " ORDER BY id DESC";
    const result = await db.query(queryText, queryParams);
    return { props: { listings: JSON.parse(JSON.stringify(result.rows)) } };
  } catch (error) {
    return { props: { listings: [] } };
  }
}