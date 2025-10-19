import { Schema, model, models, type Model, type Types } from "mongoose";
export interface IPasswordResetToken {
    _id: Types.ObjectId;
    tokenHash: string; // sha256 hash of raw token
    userId: Types.ObjectId;
    expiresAt: Date;
    createdAt: Date;
}
const PasswordResetTokenSchema = new Schema<IPasswordResetToken>({
    tokenHash: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    expiresAt: { type: Date, required: true, index: true },
    createdAt: { type: Date, default: Date.now },
});
// Optional TTL index cleanup after expiration
PasswordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
const PasswordResetToken: Model<IPasswordResetToken> = models.PasswordResetToken || model<IPasswordResetToken>("PasswordResetToken", PasswordResetTokenSchema);
export default PasswordResetToken;