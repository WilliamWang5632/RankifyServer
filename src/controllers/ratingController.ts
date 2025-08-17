import { Request, Response } from "express";
import mongoose from "mongoose";
import { Rating } from "../models/rating";
import { validateRatingData } from "../utils/validation.js";

export const getAllRatings = async (req: Request, res: Response): Promise<void> => {
  try {
    const ratings = await Rating.find().sort({ createdAt: -1 });
    console.log(`Found ${ratings.length} ratings`);
    res.json(ratings);
  } catch (err) {
    console.error("Error fetching ratings:", err);
    res.status(500).json({ error: "Failed to fetch ratings", details: err });
  }
};

export const createRating = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validation
    const validation = validateRatingData(req.body);
    if (!validation.isValid) {
      res.status(400).json({ error: validation.error });
      return;
    }

    const newRating = new Rating({
      name: req.body.name.trim(),
      picture: req.body.picture || "",
      rating: Number(req.body.rating),
      review: req.body.review.trim(),
      createdAt: req.body.createdAt ? new Date(req.body.createdAt) : new Date()
    });

    const savedRating = await newRating.save();
    console.log("Rating created successfully:", savedRating.id);
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
};

export const updateRating = async (req: Request, res: Response): Promise<void> => {
  try {
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
      res.status(404).json({ error: "Rating not found" });
      return;
    }

    console.log("Rating updated successfully");
    res.json(updatedRating);
  } catch (err) {
    console.error("Error updating rating:", err);
    res.status(500).json({ error: "Failed to update rating", details: err });
  }
};

export const deleteRating = async (req: Request, res: Response): Promise<void> => {
  try {
    const deletedRating = await Rating.findByIdAndDelete(req.params.id);
    
    if (!deletedRating) {
      res.status(404).json({ error: "Rating not found" });
      return;
    }

    console.log("Rating deleted successfully");
    res.json({ message: "Rating deleted successfully" });
  } catch (err) {
    console.error("Error deleting rating:", err);
    res.status(500).json({ error: "Failed to delete rating", details: err });
  }
};