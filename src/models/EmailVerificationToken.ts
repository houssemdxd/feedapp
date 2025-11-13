// models/EmailVerificationToken.ts
import mongoose, { Schema, models, model } from "mongoose";

const EmailVerificationTokenSchema = new Schema({
  tokenHash: { type: String, unique: true, index: true, required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  expiresAt: { type: Date, required: true, index: true },
}, { timestamps: true });

export default models.EmailVerificationToken || model("EmailVerificationToken", EmailVerificationTokenSchema);
