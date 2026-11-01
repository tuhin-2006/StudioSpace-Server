import mongoose, { Document, Schema } from 'mongoose';

export type BookingStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';

export interface IBooking extends Document {
  studioId: mongoose.Types.ObjectId;
  studioTitle: string;
  studioCategory: string;
  studioImage: string;
  hourlyRate: number;
  securityDeposit: number;
  hostEmail: string;
  userEmail: string;
  userName: string;
  userPhone?: string;
  bookingDate: string; // ISO date string "YYYY-MM-DD"
  startTime: string;   // "HH:MM" e.g. "10:00"
  endTime: string;     // "HH:MM" e.g. "14:00"
  totalHours: number;
  totalPrice: number;
  status: BookingStatus;
  specialRequests?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    studioId: {
      type: Schema.Types.ObjectId,
      ref: 'Studio',
      required: [true, 'Studio ID is required'],
    },
    studioTitle: {
      type: String,
      required: [true, 'Studio title is required'],
    },
    studioCategory: {
      type: String,
      required: true,
    },
    studioImage: {
      type: String,
      required: true,
    },
    hourlyRate: {
      type: Number,
      required: true,
    },
    securityDeposit: {
      type: Number,
      default: 0,
    },
    hostEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    userEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userPhone: {
      type: String,
      default: '',
    },
    bookingDate: {
      type: String,
      required: [true, 'Booking date (YYYY-MM-DD) is required'],
    },
    startTime: {
      type: String,
      required: [true, 'Start time (HH:MM) is required'],
    },
    endTime: {
      type: String,
      required: [true, 'End time (HH:MM) is required'],
    },
    totalHours: {
      type: Number,
      required: true,
      min: [1, 'Minimum booking is 1 hour'],
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
    specialRequests: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

BookingSchema.index({ studioId: 1, bookingDate: 1, status: 1 });
BookingSchema.index({ userEmail: 1, createdAt: -1 });

export const Booking = mongoose.model<IBooking>('Booking', BookingSchema);
