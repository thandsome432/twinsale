import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const uploadDir = path.join(process.cwd(), 'public/uploads/items');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const form = new IncomingForm({
    uploadDir: uploadDir,
    keepExtensions: true,
  });

  form.parse(req, (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'Upload failed' });

    // Handle file object (formidable v3 vs v2 differences)
    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    const fileName = path.basename(file.filepath);
    const publicUrl = `/uploads/items/${fileName}`;

    res.status(200).json({ url: publicUrl });
  });
}