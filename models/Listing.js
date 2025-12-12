import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const ListingSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['computers', 'phones', 'tablets', 'monitors', 'peripherals', 'components', 'other'],
    required: true,
  },
  condition: {
    type: String,
    enum: ['new', 'like-new', 'good', 'fair', 'for-parts'],
    required: true,
  },
  price: { type: Number, required: true },
  images: [{ type: String }],
  seller: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['available', 'pending', 'sold'],
    default: 'available',
  },
}, { timestamps: true });

const Listing = model('Listing', ListingSchema);

export default Listing;
