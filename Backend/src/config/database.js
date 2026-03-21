import dns from "node:dns/promises";

dns.setServers(["1.1.1.1", "8.8.8.8"]);

import mongoose from "mongoose";
import "dotenv/config"

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ MongoDB connected");
};

export default connectDB;