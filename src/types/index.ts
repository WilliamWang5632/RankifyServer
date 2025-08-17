import { Document } from "mongoose";

export interface IRating extends Document {
  name: string;
  picture?: string;
  rating: number;
  review: string;
  createdAt?: Date;
}