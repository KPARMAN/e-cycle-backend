import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import Listing from './models/Listing.js';
import { authenticateToken } from './middleware/auth.js';
import path from 'path';
import fs from 'fs';

dotenv.config();
connectDB();

const app = express();

// Build allowed origins list from FRONTEND_URL (comma-separated) if provided
const allowedOrigins = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',').map(s => s.trim()) : null;

// Dynamic CORS: allow requests with no origin (curl/file:// -> 'null') and
// allow configured FRONTEND_URL(s). For development, when FRONTEND_URL is unset,
// allow all origins.
app.use(cors({
  origin: (origin, callback) => {
    // origin can be undefined when requests are same-origin from the server
    if (!origin || origin === 'null') return callback(null, true);
    if (!allowedOrigins) return callback(null, true);
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// Ensure uploads dir exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
app.use('/uploads', express.static(uploadDir));

// Serve local test pages (so you can open them over http://localhost:PORT/test/...)
// This prevents `file://` origin CORS issues when using the test HTML clients.
app.use('/test', express.static(path.join(process.cwd(), 'test')));

app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/health', healthRoutes);

app.get('/api/test', (req, res) => res.json({ message: 'Backend running' }));

// ============================================
// LISTING ROUTES
// ============================================

// Get all listings (public - no auth required)
app.get('/api/listings', async (req, res) => {
  try {
    const listings = await Listing.find()
      .populate('seller', 'name email')
      .sort({ createdAt: -1 });
    res.json(listings);
  } catch (error) {
    console.error('Error fetching listings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single listing by ID
app.get('/api/listings/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('seller', 'name email');

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    res.json(listing);
  } catch (error) {
    console.error('Error fetching listing:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's own listings (requires auth)
app.get('/api/listings/user/me', authenticateToken, async (req, res) => {
  try {
    const listings = await Listing.find({ seller: req.user.id })
      .sort({ createdAt: -1 });
    res.json(listings);
  } catch (error) {
    console.error('Error fetching user listings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new listing (requires auth)
app.post('/api/listings', authenticateToken, async (req, res) => {
  try {
    const { title, description, category, condition, price, images } = req.body;

    if (!title || !description || !category || !condition || !price) {
      return res.status(400).json({ message: 'All fields required' });
    }

    const listing = new Listing({
      title,
      description,
      category,
      condition,
      price: parseFloat(price),
      images: images || [],
      seller: req.user.id
    });

    await listing.save();
    await listing.populate('seller', 'name email');

    res.status(201).json(listing);
  } catch (error) {
    console.error('Error creating listing:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update listing (requires auth)
app.put('/api/listings/:id', authenticateToken, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Check if user owns this listing
    if (listing.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { title, description, category, condition, price, images, status } = req.body;

    if (title) listing.title = title;
    if (description) listing.description = description;
    if (category) listing.category = category;
    if (condition) listing.condition = condition;
    if (price) listing.price = parseFloat(price);
    if (images) listing.images = images;
    if (status) listing.status = status;

    await listing.save();
    await listing.populate('seller', 'name email');

    res.json(listing);
  } catch (error) {
    console.error('Error updating listing:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete listing (requires auth)
app.delete('/api/listings/:id', authenticateToken, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Check if user owns this listing
    if (listing.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await listing.deleteOne();
    res.json({ message: 'Listing deleted' });
  } catch (error) {
    console.error('Error deleting listing:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============================================
// DASHBOARD STATS (requires auth)
// ============================================

app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's listing count
    const totalListings = await Listing.countDocuments({ seller: userId });

    // Get active listings count
    const activeListings = await Listing.countDocuments({ 
      seller: userId, 
      status: 'available' 
    });

    // Get sold listings count
    const soldListings = await Listing.countDocuments({ 
      seller: userId, 
      status: 'sold' 
    });

    // Calculate total value (sum of all listing prices)
    const listings = await Listing.find({ seller: userId });
    const totalValue = listings.reduce((sum, listing) => sum + listing.price, 0);

    res.json({
      totalListings,
      activeListings,
      soldListings,
      totalValue: totalValue.toFixed(2)
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
