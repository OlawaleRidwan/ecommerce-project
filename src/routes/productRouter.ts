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

const productRrouter = express.Router();

// Create a new product
productRrouter.post("/create-product",identifier,  upload.array('images', 4 ),uploadToCloudinary,CreateProduct);

// Get all products
productRrouter.get("/all-product",identifier, GetAllProducts);

// Get a product by ID
productRrouter.get("/product-by-id/:id",identifier, GetProductById);

// Update a product
productRrouter.put("/update-product/:id",identifier,upload.array('images', 4 ),uploadToCloudinary, UpdateProduct);

// Delete a product
productRrouter.delete("/delete-product/:id",identifier, DeleteProduct);

// Get products by a seller
productRrouter.get("/seller/:id",identifier, GetProductsBySeller);

//Get products by category

productRrouter.get("/all-by-category/:category",identifier, GetProductsByCategory);


// Search and filter products
productRrouter.get("/search-product",identifier, SearchProducts);

export default productRrouter;
