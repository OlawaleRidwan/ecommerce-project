import mongoose, { Schema, Document } from "mongoose";

// Define TypeScript Interface for Product
export interface IProduct extends Document {
  name: string;
  price: number;
  totalPrice: number;
  quantity: number;
  picture?: string[];
  description?: string;
  color?: string;
  size?: string;
  category: ProductCategory;
  user: mongoose.Types.ObjectId; // Reference to User
}

// Enum for Product Categories
export enum ProductCategory {
  ELECTRONICS = "Electronics",
  CLOTHING = "Clothing",
  HOME_APPLIANCES = "Home Appliances",
  BEAUTY = "Beauty",
  SPORTS = "Sports",
  TOYS = "Toys",
  BOOKS = "Books",
  FOOD = "Food",
  AUTOMOTIVE = "Automotive",
}

// Define Mongoose Schema
const ProductSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 0 },
    picture: { type: [{ type: String }], trim: true },
    description: { type: String, trim: true },
    color: { type: String, trim: true },
    size: { type: String, trim: true },
    category: { 
      type: String, 
      enum: Object.values(ProductCategory), 
      required: true 
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Many-to-One relationship
  },
  { timestamps: true }
);


// Export Mongoose Model
const ProductModel = mongoose.model<IProduct>("Product", ProductSchema);
export default ProductModel;
