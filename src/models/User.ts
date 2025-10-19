 import { Schema, model, models, type Model, type Types } from "mongoose";

 export type UserRole = "client" | "organization";

 export interface IUser {
   _id: Types.ObjectId;
   fname: string;
   lname: string;
 email: string;
  password: string;
  role: UserRole;
 }

 const UserSchema = new Schema<IUser>(
   {
     fname: { type: String, required: true, trim: true },
     lname:  { type: String, required: true, trim: true },
     email:     { type: String, required: true, unique: true, lowercase: true, index: true },
     password:  { type: String, required: true },
     role:      { type: String, enum: ["client", "organization"], default: "client", required: true },
   },
   { timestamps: true }
 );

 const User: Model<IUser> = models.User || model<IUser>("User", UserSchema);
 export default User;
// src/models/User.ts
