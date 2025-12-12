import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import { Readable } from 'stream';
import { protect } from '../middleware/auth.js';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const router = express.Router();

// Multer memory storage (store files in RAM temporarily)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Accept images only
  if (!file.mimetype.startsWith('image/')) return cb(new Error('Only images allowed'), false);
  cb(null, true);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

// Public upload (no auth) - change to protect if you want only logged-in users
router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  // Create a readable stream from buffer
  const stream = Readable.from(req.file.buffer);

  // Upload to Cloudinary
  const uploadStream = cloudinary.uploader.upload_stream(
    {
      folder: 'e-cycle-uploads',
      resource_type: 'auto'
    },
    (error, result) => {
      if (error) {
        return res.status(500).json({ message: 'Upload failed', error: error.message });
      }
      
      res.json({
        success: true,
        filename: req.file.originalname,
        url: result.secure_url,
        public_id: result.public_id
      });
    }
  );

  stream.pipe(uploadStream);
});

// List uploads (Cloudinary)
// Query params:
// - folder: folder prefix to list (default: 'e-cycle-uploads')
// - max_results: number of items to return (default: 50)
// - next_cursor: pagination cursor returned by Cloudinary
router.get('/list', async (req, res) => {
  const { folder = 'e-cycle-uploads', max_results = 50, next_cursor } = req.query;

  try {
    const options = {
      type: 'upload',
      prefix: `${folder}/`,
      max_results: parseInt(max_results, 10) || 50
    };

    if (next_cursor) options.next_cursor = next_cursor;

    const result = await cloudinary.api.resources(options);

    return res.json({
      success: true,
      resources: result.resources || [],
      next_cursor: result.next_cursor || null
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Could not list uploads', error: error.message });
  }
});

export default router;
