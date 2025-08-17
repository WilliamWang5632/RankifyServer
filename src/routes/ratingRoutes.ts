import { Router } from "express";
import { 
  getAllRatings, 
  createRating, 
  updateRating, 
  deleteRating 
} from "../controllers/ratingController.js";

const router = Router();

// GET /api/ratings - Get all ratings
router.get("/", getAllRatings);

// POST /api/ratings - Create a new rating
router.post("/", createRating);

// PUT /api/ratings/:id - Update a rating
router.put("/:id", updateRating);

// DELETE /api/ratings/:id - Delete a rating
router.delete("/:id", deleteRating);

export default router;