import express, { Request, Response } from "express";
import mongoose, { Schema, Document } from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increase limit for base64 images

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Define a TypeScript interface for your collection
interface IRating extends Document {
  name: string;
  picture?: string;
  rating: number;
  review: string;
  createdAt?: Date;
}

// Schema + Model - FIXED: Removed custom 'id' field that conflicts with MongoDB's _id
const RatingSchema = new Schema<IRating>(
  {
    name: { type: String, required: true },
    picture: { type: String },
    rating: { type: Number, required: true, min: 0, max: 10 },
    review: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { 
    collection: "ratings",
    // This ensures the returned JSON has 'id' instead of '_id'
    toJSON: { 
      transform: function(doc: any, ret: any) {
        ret.id = ret._id?.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// FIXED: Use correct collection name
const Rating = mongoose.model<IRating>("Rating", RatingSchema);


// Routes
app.get("/", (req: Request, res: Response) => {
  res.send("API is running...");
});

// Get all ratings - FIXED: Added proper error logging
app.get("/ratings", async (req: Request, res: Response) => {
  try {
    console.log("📥 GET /ratings - Fetching all ratings");
    const ratings = await Rating.find().sort({ createdAt: -1 });
    console.log(`📤 Found ${ratings.length} ratings`);
    res.json(ratings);
  } catch (err) {
    console.error("❌ Error fetching ratings:", err);
    res.status(500).json({ error: "Failed to fetch ratings", details: err });
  }
});

// Add a rating - FIXED: Added validation and better error handling
app.post("/ratings", async (req: Request, res: Response) => {
  try {
    console.log("📥 POST /ratings - Creating new rating");
    console.log("Request body:", { ...req.body, picture: req.body.picture ? '[IMAGE_DATA]' : 'none' });
    
    // Validation
    if (!req.body.name || !req.body.review || req.body.rating === undefined) {
      return res.status(400).json({ 
        error: "Missing required fields: name, review, and rating are required" 
      });
    }

    if (req.body.rating < 0 || req.body.rating > 10) {
      return res.status(400).json({ 
        error: "Rating must be between 0 and 10" 
      });
    }

    const newRating = new Rating({
      name: req.body.name.trim(),
      picture: req.body.picture || "",
      rating: Number(req.body.rating),
      review: req.body.review.trim(),
      createdAt: req.body.createdAt ? new Date(req.body.createdAt) : new Date()
    });

    const savedRating = await newRating.save();
    console.log("✅ Rating created successfully:", savedRating.id);
    res.status(201).json(savedRating);
  } catch (err) {
    console.error("❌ Error creating rating:", err);
    if (err instanceof mongoose.Error.ValidationError) {
      res.status(400).json({ 
        error: "Validation error", 
        details: err.message 
      });
    } else {
      res.status(500).json({ 
        error: "Failed to create rating", 
        details: err 
      });
    }
  }
});

// Update a rating - FIXED: Added PUT endpoint that was missing
app.put("/ratings/:id", async (req: Request, res: Response) => {
  try {
    console.log(`📥 PUT /ratings/${req.params.id} - Updating rating`);
    
    const updatedRating = await Rating.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name?.trim(),
        picture: req.body.picture,
        rating: req.body.rating,
        review: req.body.review?.trim(),
      },
      { new: true, runValidators: true }
    );

    if (!updatedRating) {
      return res.status(404).json({ error: "Rating not found" });
    }

    console.log("✅ Rating updated successfully");
    res.json(updatedRating);
  } catch (err) {
    console.error("❌ Error updating rating:", err);
    res.status(500).json({ error: "Failed to update rating", details: err });
  }
});

// Delete a rating - FIXED: Added DELETE endpoint that was missing
app.delete("/ratings/:id", async (req: Request, res: Response) => {
  try {
    console.log(`📥 DELETE /ratings/${req.params.id} - Deleting rating`);
    
    const deletedRating = await Rating.findByIdAndDelete(req.params.id);
    
    if (!deletedRating) {
      return res.status(404).json({ error: "Rating not found" });
    }

    console.log("✅ Rating deleted successfully");
    res.json({ message: "Rating deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting rating:", err);
    res.status(500).json({ error: "Failed to delete rating", details: err });
  }
});

// Add a catch-all error handler
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error("🚨 Unhandled error:", err);
  res.status(500).json({ error: "Internal server error", details: err.message });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));