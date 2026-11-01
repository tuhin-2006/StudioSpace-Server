import mongoose, { Document, Schema } from 'mongoose';

export type StudioCategory =
  | 'Photo Studio'
  | 'Sound Stage'
  | 'Film Stage'
  | 'Podcast Room'
  | 'Podcast Lounge'
  | 'Music Suite'
  | 'Music Studio'
  | 'Art Workshop';

export interface IStudio extends Document {
  title: string;
  category: StudioCategory;
  hourlyRate: number;
  securityDeposit: number;
  maxCapacity: number;
  location: string;
  address: string;
  imageUrl: string;
  galleryImages: string[];
  amenities: string[];
  overview: string;
  hostName: string;
  hostEmail: string;
  hostAvatar?: string;
  rating: number;
  reviewsCount: number;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const StudioSchema = new Schema<IStudio>(
  {
    title: {
      type: String,
      required: [true, 'Studio title is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Studio category is required'],
      enum: [
        'Photo Studio',
        'Sound Stage',
        'Film Stage',
        'Podcast Room',
        'Podcast Lounge',
        'Music Suite',
        'Music Studio',
        'Art Workshop',
      ],
      trim: true,
    },
    hourlyRate: {
      type: Number,
      required: [true, 'Hourly rate is required'],
      min: [0, 'Hourly rate cannot be negative'],
    },
    securityDeposit: {
      type: Number,
      required: [true, 'Security deposit is required'],
      default: 0,
      min: [0, 'Security deposit cannot be negative'],
    },
    maxCapacity: {
      type: Number,
      required: [true, 'Max capacity is required'],
      min: [1, 'Capacity must be at least 1 person'],
    },
    location: {
      type: String,
      required: [true, 'General location/city is required'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Full address is required'],
      trim: true,
    },
    imageUrl: {
      type: String,
      required: [true, 'Main studio image URL is required'],
    },
    galleryImages: {
      type: [String],
      default: [],
    },
    amenities: {
      type: [String],
      default: [],
    },
    overview: {
      type: String,
      required: [true, 'Detailed studio overview is required'],
    },
    hostName: {
      type: String,
      required: [true, 'Host name is required'],
    },
    hostEmail: {
      type: String,
      required: [true, 'Host email is required'],
      lowercase: true,
      trim: true,
    },
    hostAvatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
    },
    rating: {
      type: Number,
      default: 4.9,
      min: 0,
      max: 5,
    },
    reviewsCount: {
      type: Number,
      default: 12,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

StudioSchema.index({ category: 1, rating: -1, createdAt: -1 });
StudioSchema.index({ hostEmail: 1 });

export const Studio = mongoose.model<IStudio>('Studio', StudioSchema);
