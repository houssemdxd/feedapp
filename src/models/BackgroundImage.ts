import mongoose, { Schema, Document } from 'mongoose';

export interface IBackgroundImage extends Document {
  filename: string;
  originalName: string;
  path: string;
  size: number;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BackgroundImageSchema = new Schema<IBackgroundImage>(
  {
    filename: { type: String, required: true, unique: true },
    originalName: { type: String, required: true },
    path: { type: String, required: true },
    size: { type: Number, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Index for efficient queries
BackgroundImageSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.BackgroundImage || mongoose.model<IBackgroundImage>('BackgroundImage', BackgroundImageSchema);
