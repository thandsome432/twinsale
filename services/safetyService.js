const db = require('../db'); 
const crypto = require('crypto');
// Mock database client
const db = require('../db'); 
// Mock file storage (like AWS S3)
const storage = require('../utils/storage');

const ENCRYPTION_KEY = process.env.SAFE_KEY; // Must be 32 chars
const IV_LENGTH = 16;

// 1. ENCRYPTION FUNCTION [cite: 14, 24]
function encryptBuffer(buffer) {
  let iv = crypto.randomBytes(IV_LENGTH);
  let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

// 2. CRON JOB: Runs every hour to check for expired selfies 
// Schedule: '0 * * * *' means "at minute 0 of every hour"
cron.schedule('0 * * * *', async () => {
  console.log('🔒 Running Safety Cleanup Protocol...');
  
  // Find sessions where expiration time has passed
  const now = new Date();
  const expiredSessions = await db.query(
    "SELECT * FROM verification_sessions WHERE expires_at < $1", 
    [now]
  );

  for (const session of expiredSessions) {
    try {
      // Step A: Delete the physical file from storage (S3)
      await storage.deleteFile(session.seller_selfie_url);
      await storage.deleteFile(session.buyer_selfie_url);

      // Step B: Wipe the URL from the database, keeping only metadata [cite: 26]
      await db.query(
        "UPDATE verification_sessions SET seller_selfie_url = NULL, buyer_selfie_url = NULL, status = 'cleaned' WHERE id = $1",
        [session.id]
      );
      
      console.log(`✅ Sanitized Session ID: ${session.id}`);
    } catch (err) {
      console.error(`❌ Error sanitizing session ${session.id}:`, err);
    }
  }
});

module.exports = { encryptBuffer };