import mongoose, { Schema } from "mongoose";
import { IRating } from "../types/index.js";

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

export const Rating = mongoose.model<IRating>("Rating", RatingSchema);