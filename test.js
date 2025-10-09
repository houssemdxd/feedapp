// test.js
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mongoose from "mongoose";

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the .env.local manually
dotenv.config({ path: path.join(__dirname, ".env.local") });

// Get the Mongo URI
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI not found. Check your .env.local!");
  process.exit(1);
}

// Connect to MongoDB
let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(MONGODB_URI);
  isConnected = true;
  console.log("✅ MongoDB connected");
}

// Test function
async function runTest() {
  try {
    await connectDB();

    // Test: create a dummy user
    const userSchema = new mongoose.Schema({
      email: String,
      password: String,
    });
    const User = mongoose.model("User", userSchema);

    const user = await User.create({ email: "test@test.com", password: "12345" });
    console.log("✅ Dummy user created:", user);

    // Close connection
    await mongoose.connection.close();
    console.log("✅ Connection closed");
  } catch (err) {
    console.error("❌ Connection failed:", err);
  }
}

runTest();
