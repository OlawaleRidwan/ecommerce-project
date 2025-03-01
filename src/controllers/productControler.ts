import { Request, Response } from "express";
// import ProductModel from "../models/productModels";
import { createProductSchema,updateProductSchema } from "../middlewares/productValidator";
import mongoose from "mongoose";
import { createProduct, deleteProduct, getAllProducts, getOneByQuery, getProductById, getProductsByCategory, getProductsBySeller, searchProducts, updateProduct } from "../services/productService";
// Create a new product
export const CreateProduct = async (req: Request, res: Response) => {
  try {

    const { userId} = req.user;
    console.log("User ID",userId)
    const cloudinaryUrls = req.body.cloudinaryUrls;
    console.log("Cloudinary URLs:", cloudinaryUrls)
        // if (cloudinaryUrls.length === 0) {
        //     console.error('No Cloudinary URLs found.');
        //     res.status(500).send('Internal Server Error');
        //     return
        // }
    const images = cloudinaryUrls;
    console.log(images)
    const {name} = req.body;
    const { error, value } = createProductSchema.validate(req.body);

    if (error) {
        res.status(401).json({success:false, message: error.details[0].message})
        return
    }
    
    const existingProduct = await getOneByQuery({user: userId,name })
    
    if(existingProduct) {
        res.status(401).json({success: false, message: "Product already exist!"})
        return
    }

   
    const product = await createProduct(userId, req.body, cloudinaryUrls)

    res.status(201).json({ 
        success: true,
        message: "Product created successfully",product })
    return
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating product", error });
    return
  }
};

// Get all products
export const GetAllProducts = async (req: Request, res: Response) => {
  const {page} = req.query;
  const productsPerPage =10;
  
  try {

    const products = await getAllProducts(Number(page), productsPerPage)
    
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching products", error });
  }
};

// Get a product by ID
export const GetProductById = async (req: Request, res: Response) => {
    
  try {
    const {id} = req.params;
   
    const product = await getProductById(id)
    // if (!product) res.status(404).json({ message: "Product not found" });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "Error fetching product", error });
  }
};

// Update a product
export const UpdateProduct = async (req: Request, res: Response) => {
  try {
    const {id} = req.params;
    const objectId = new mongoose.Types.ObjectId(id);
    const cloudinaryUrls = req.body.cloudinaryUrls;
    console.log("Cloudinary URLs:", cloudinaryUrls)
    const images = cloudinaryUrls;
    console.log(images)
    // const {name,price, quantity,description,color,size,category} = req.body;
    const { error, value } = updateProductSchema.validate(req.body);
    
    if (error) {
      res.status(401).json({success:false, message: error.details[0].message})
      return
    }

    // const product = await getProductById(id);

    // Update only the fields that were provided
    // if (name) product.name = name;
    // if (price) product.price = price;
    // if (quantity) product.quantity = quantity;
    // if (description) product.description = description;
    // if (color) product.color = color;
    // if (size) product.size = size;
    // if (category) product.category = category;
    // if (cloudinaryUrls.length > 0) product.picture = images
    
    // Save updated user
    // await product.save();
    console.log(1000000)
    const updatedProduct = await updateProduct(id, req.body,cloudinaryUrls)
    console.log(updateProduct)
    res.status(200).json({ message: "Product updated successfully", product: updatedProduct });
    return
  } catch (error) {
    res.status(500).json({ message: "Error updating product 1", error });
    return
  }
};

// Delete a product
export const DeleteProduct = async (req: Request, res: Response) => {
  try {
    const {id} = req.params
    const product = await deleteProduct(id);
    // if (!product) res.status(404).json({ message: "Product not found" });
    res.status(200).json({ message: "Product deleted successfully" ,product});
  } catch (error) {
    res.status(500).json({ message: "Error deleting product", error });
  }
};

// Get all products by a seller (user ID)
export const GetProductsBySeller = async (req: Request, res: Response) => {
  try {
    const {id} = req.params
    const products = await getProductsBySeller(id)
    
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching seller's products", error });
  }
};

//Get all product by category

export const GetProductsByCategory = async (req: Request, res: Response) => {
  try {
    console.log(12345678)


    const { category } = req.params; // Extract category from URL
    const {user} = req.query
    const userId = new mongoose.Types.ObjectId(user as string)
    const filter: any = {};

    if (user) filter.user = userId;

    // Find products that match the given category
    const products = await getProductsByCategory(category,filter);
    // console.log({category,products})
    // if (products.length === 0) {
    //   res.status(404).json({ success: false, message: "No products found in this category" });
    // }

    res.status(200).json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// Search and filter products
export const SearchProducts = async (req: Request, res: Response) => {
  try {
    const { name, minPrice, maxPrice, color } = req.query;
    const filter: any = {};

    if (name) filter.name = { $regex: name, $options: "i" };
    if (minPrice) filter.price = { ...filter.price, $gte: Number(minPrice) };
    if (maxPrice) filter.price = { ...filter.price, $lte: Number(maxPrice) };
    if (color) filter.color = color;

    const products = await searchProducts(filter);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Error searching products", error });
  }
};
                                                                                                                                                                                                                                                                                                                                                                                                                    