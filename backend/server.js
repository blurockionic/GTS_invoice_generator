import mongoose from "mongoose";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import router from "./router.js";

dotenv.config(); // Load environment variables from .env file

const PORT = process.env.PORT || 3000; // Use environment variable for PORT or default to 3000
const MONGO_DB_DATABASE_URL = process.env.MONGO_DB_DATABASE_URL; // MongoDB connection URL

const app = express();

// Middleware setup
app.use(cors({
  origin: "http://localhost:5173", // Update the origin to match your frontend's URL
}));

app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// API routes
app.use("/", router);

// Database connection
mongoose.connect(MONGO_DB_DATABASE_URL)
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
