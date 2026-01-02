import { useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../../components/Navbar';
import db from '../../db'; // This connects to your database

export default function SafetyRoom({ session, error }) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [mySelfie, setMySelfie] = useState(session?.seller_selfie_url || null);

  // If the server failed to find the session, show the error on screen
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-xl text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-4">Debug Error</h1>
          <p className="text-gray-700 font-mono bg-gray-200 p-4 rounded text-left">
            {error}
          </p>
          <p className="mt-4 text-sm text-gray-500">
            Show this message to your developer (Gemini).
          </p>
        </div>
      </div>
    );
  }

  // ... (Rest of the normal Safety Room Logic) ...
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('sessionId', session.id);
    formData.append('role', 'seller'); // Hardcoded for testing

    try {
      const res = await fetch('/api/safety/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        setMySelfie(data.url);
        alert('Selfie Uploaded!');
      } else {
        alert('Upload failed: ' + data.error);
      }
    } catch (err) {
      alert('Upload error');
    }
    setUploading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6 mt-8">
        <h1 className="text-3xl font-bold mb-4">Session #{session.id}</h1>
        
        {/* Simple Upload Test UI */}
        <div className="bg-white p-8 rounded shadow text-center">
           <h2 className="mb-4 font-bold">My Selfie</h2>
           {mySelfie ? (
             <img src={mySelfie} className="h-64 mx-auto rounded mb-4" />
           ) : (
             <div className="h-64 bg-gray-200 mb-4 flex items-center justify-center">No Photo</div>
           )}
           
           <input type="file" onChange={handleUpload} />
           {uploading && <p>Uploading...</p>}
        </div>
      </div>
    </div>
  );
}

// --- THE DEBUGGING SERVER CODE ---
// --- REPLACE ONLY THE BOTTOM FUNCTION WITH THIS ---

export async function getServerSideProps(context) {
    const { id } = context.params;
  
    try {
      const result = await db.query("SELECT * FROM verification_sessions WHERE id = $1", [id]);
  
      if (result.rows.length === 0) {
        return { 
          props: { error: `Session ID ${id} not found.` } 
        };
      }
  
      // THE FIX: We convert the data to JSON and back to String to turn all Dates into text
      // This stops the "Serialization Error" instantly.
      const cleanSession = JSON.parse(JSON.stringify(result.rows[0]));
  
      return {
        props: {
          session: cleanSession,
        },
      };
  
    } catch (err) {
      return {
        props: { error: `Server Error: ${err.message}` }
      };
    }
  }