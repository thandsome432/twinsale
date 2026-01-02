import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';
import db from '../../../db';

export const config = {
  api: {
    bodyParser: false, // Disable Next.js default parser to handle files
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  // 1. Setup temporary storage folder
  const uploadDir = path.join(process.cwd(), 'public/uploads/temp');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const form = new IncomingForm({
    uploadDir: uploadDir,
    keepExtensions: true,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'Upload failed' });

    // "files.file" is the image sent from frontend
    // "fields.sessionId" tells us which transaction this is
    // "fields.role" tells us if this is the buyer or seller
    
    // Note: 'files.file' might be an array depending on version, handling both:
    const fileObj = Array.isArray(files.file) ? files.file[0] : files.file;
    const fileName = path.basename(fileObj.filepath);
    const publicUrl = `/uploads/temp/${fileName}`;
    
    const sessionId = Array.isArray(fields.sessionId) ? fields.sessionId[0] : fields.sessionId;
    const role = Array.isArray(fields.role) ? fields.role[0] : fields.role;

    try {
      // 2. Save the file path to the database
      const column = role === 'seller' ? 'seller_selfie_url' : 'buyer_selfie_url';
      
      await db.query(
        `UPDATE verification_sessions SET ${column} = $1 WHERE id = $2`,
        [publicUrl, sessionId]
      );

      res.status(200).json({ success: true, url: publicUrl });
    } catch (dbError) {
      console.error(dbError);
      res.status(500).json({ error: 'Database update failed' });
    }
  });
}