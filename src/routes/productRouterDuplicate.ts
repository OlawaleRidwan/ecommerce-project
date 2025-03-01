import express from "express";
import {upload, uploadToCloudinary } from '../middlewares/cloudinary'; //the file path where you had written this functions in earlier
import  identifier from '../middlewares/identification';
import { 
  CreateProduct, 
  GetAllProducts, 
  GetProductById, 
  UpdateProduct, 
  DeleteProduct, 
  GetProductsBySeller,
  GetProductsByCategory, 
  SearchProducts 
} from "../controllers/productControler";

const ProductRrouter = express.Router();

// Create a new product
ProductRrouter.post("/create-product",identifier,  upload.array('images', 4 ),uploadToCloudinary,CreateProduct);

// Get all products
ProductRrouter.get("/all-product",identifier, GetAllProducts);

// Get a product by ID
ProductRrouter.get("/product-by-id/:id",identifier, GetProductById);

// Update a product
ProductRrouter.put("/update-product/:id",identifier,upload.array('images', 4 ),uploadToCloudinary, UpdateProduct);

// Delete a product
ProductRrouter.delete("/delete-product/:id",identifier, DeleteProduct);

// Get products by a seller
ProductRrouter.get("/seller/:id",identifier, GetProductsBySeller);

//Get products by category

ProductRrouter.get("/all-by-category/:category",identifier, GetProductsByCategory);


// Search and filter products
ProductRrouter.get("/search-product",identifier, SearchProducts);

export default ProductRrouter;
