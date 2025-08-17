import express, { Request, Response } from "express";
import cors from "cors";
import { connectDatabase } from "./config/database.js";
import ratingRoutes from "./routes/ratingRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

// Middleware
app.use(cors({
  origin: ["http://localhost:5173", "https://rankify-mauve.vercel.app"],
  credentials: true
}));
app.use(express.json({ limit: '10mb' })); // Increase limit for base64 images

// Connect to database
connectDatabase();

// Routes
app.get("/", (req: Request, res: Response) => {
  res.send("API is running...");
});

// API routes
app.use("/ratings", ratingRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));