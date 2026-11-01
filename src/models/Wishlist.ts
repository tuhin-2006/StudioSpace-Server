import mongoose, { Document, Schema } from 'mongoose';

export interface IWishlist extends Document {
  userEmail: string;
  studioId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const WishlistSchema = new Schema<IWishlist>(
  {
    userEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    studioId: {
      type: Schema.Types.ObjectId,
      ref: 'Studio',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

WishlistSchema.index({ userEmail: 1, studioId: 1 }, { unique: true });

export const Wishlist = mongoose.model<IWishlist>('Wishlist', WishlistSchema);
