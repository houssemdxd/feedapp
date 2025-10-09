import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
   fname: { type: String, required: true },   // first name
    lname: { type: String, required: true },   // last name
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

export default mongoose.models.User || mongoose.model("User", userSchema);
