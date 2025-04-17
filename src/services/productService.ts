import { Request, Response } from "express";
import ProductModel, { IProduct } from "../models/productModel";
import { createProductSchema,updateProductSchema } from "../middlewares/productValidator";
import mongoose from "mongoose";
import redisClient from "../utils/redisClient";
// Create a new product

export const createProduct = async (userId: string, body: IProduct, cloudinaryUrls?: any) => {
  try {

    // const { userId} = req.user;
    // console.log("User ID",userId)
    // const cloudinaryUrls = body.cloudinaryUrls;
    console.log("Cloudinary URLs:", cloudinaryUrls)
        // if (cloudinaryUrls.length === 0) {
        //     console.error('No Cloudinary URLs found.');
        //     res.status(500).send('Internal Server Error');
        //     return
        // }
    const images = cloudinaryUrls;
    console.log(images)
    const {name,price, quantity,description,color,size,category} = body;
    const totalPrice: number = Number(price) + Number(0.05 * price)

    // const existingProduct = await ProductModel.findOne({user: userId,name }).select('name')
    const newProduct = {
        name,
        price,
        totalPrice,
        quantity,
        picture: images,
        description,
        color,
        size,
        category,
        user: userId
    }

    const product = await ProductModel.create(newProduct);
    const savedProduct = await product.save();

    // Invalidate relevant caches

    // Invalidate all product page caches
    const keys = await redisClient.keys('products:page:*');
    if (keys.length > 0) {
      await redisClient.del(keys);
    }

    // Invalidate the category cache 
    await redisClient.del(`category:${category}`); // Clear category cache

    return { message: "Product created successfully",product: savedProduct }
  } catch (error) {
    console.log(error)
   }
};

// Get all products
export const getAllProducts = async (page: number = 1, productsPerPage: number = 10) => {
  

const cacheKey = `products:page:${page}`;

  // Check cache first
const cachedProducts = await redisClient.get(cacheKey);
  if (cachedProducts) {
    return JSON.parse(cachedProducts);
  }

  try {

    let pageNum = 0;
        if ( Number(page) <= 1) {
            pageNum = 0;
        } else {
            pageNum = Number(page) -1
        }

    const products = await ProductModel.find().sort({createdAt: -1}).skip(pageNum * productsPerPage).limit(productsPerPage).select('-user').populate("user", "username email");
    
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(products));

    return products;
  } catch (error) {
    console.log(error)
  }
};

// Get a product by ID
export const getProductById = async (id: string) => {
    // const {id} = req.params;
    const objectId = new mongoose.Types.ObjectId(id);
    const cacheKey = `product:${id}`;

    // Check if product is in cache
  const cachedProduct = await redisClient.get(cacheKey);
  if (cachedProduct) {
    return JSON.parse(cachedProduct);
  }

    
  try {
    const product = await ProductModel.findById(objectId).populate("user", "username email");
    if (!product) throw new Error("Product not found");

    await redisClient.setEx(cacheKey, 3600, JSON.stringify(product));
    return product
  } catch (error) {
    console.log(error)
  }
};

// Update a product
export const updateProductQuantityById = async (id: string, quantity: number) => {
  try {
    const updatedProduct = await ProductModel.findOneAndUpdate(
      { _id: id },
      { $inc: { quantity: -quantity } }, // Decrease quantity
      { new: true, runValidators: true } // Return updated document & apply schema validation
    );

    if (!updatedProduct) {
      throw new Error("Product not found or could not be updated");
    }

    console.log("Updated Product:", updatedProduct);
    return updatedProduct;
  } catch (error) {
    console.error("Error updating product quantity:", error);
    throw new Error("Failed to update product quantity");
  }
};


export const updateProduct = async (id : string, body: Partial<IProduct>, cloudinaryUrls: string[]=[]) => {
  try {
    // const objectId = new mongoose.Types.ObjectId(id);
    const {name,price, quantity,description,color,size,category} = body;
  
    const product = await getProductById(id)
    console.log(product)
     console.log(id)
     console.log('very nice')
    // Update only the fields that were provided
    if (name) product.name = name;
    if (price) {
      product.price = price;
      product.totalPrice = Number(price) + Number( 0.05 * price);
    }
    if (quantity) product.quantity = quantity;
    if (description) product.description = description;
    if (color) product.color = color;
    if (size) product.size = size;
    if (category) product.category = category;
    if (cloudinaryUrls.length > 0) product.picture = cloudinaryUrls
    console.log("fantastic")   
    // Save updated user
    const savedProduct = await product.save();
    console.log("Great!")


    // Invalidate cache for this product
    await redisClient.del(`product:${id}`);
    await redisClient.del(`category:${category}`);

    return savedProduct
    // return ({ message: "Product updated successfully", product: newProduct });
  } catch (error) {
    console.log(error)

  }
};

// Delete a product
export const deleteProduct = async (id: string) => {
  try {
    const objectId = new mongoose.Types.ObjectId(id);
    const product = await ProductModel.findByIdAndDelete(id);
    if (!product) throw new Error("Product not found");

    // Invalidate caches
    await redisClient.del(`product:${id}`);
    await redisClient.del(`category:${product.category}`);

    return ({ message: "Product deleted successfully" });
  } catch (error) {
    console.log(error)

  }
};


// Get all products by a seller (user ID)
export const getProductsBySeller = async (id: string) => {
  try {
    const objectId = new mongoose.Types.ObjectId(id);
    const products = await ProductModel.find({ user: objectId }).select('name price category quantity picture');
    return products
  } catch (error) {
    console.log(error)

}
};


// Get one by product by query
export const getOneByQuery = async (filter: any) => {
    try {
      const product = await ProductModel.findOne(filter)
      return product
    } catch (error) {
      console.log(error)

  }
  };
  

//Get all product by category

export const getProductsByCategory = async (category: string, filter?: any) => {
  
  const cacheKey = `category:${category}`;

  // Check if category products are cached
  const cachedProducts = await redisClient.get(cacheKey);
  if (cachedProducts) {
    return JSON.parse(cachedProducts);
  }

  
  try {
    console.log(1234)

    let findOptions: any={};
    if (filter.user) findOptions.user = filter.user;
    console.log(findOptions)
    // const {user} = req.query
    // Find products that match the given category
    const products = await ProductModel.find({ category, ...findOptions });
    // console.log({category,products})
    if (products.length === 0) {
        throw new Error("No products found in this category")
    }

       // Store in cache
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(products));
    return { success: true, products };
  } catch (error) {
    console.log(error)
  }
};

// Search and filter products
export const searchProducts = async (filter: any) => {
  try {
    // const { name, minPrice, maxPrice, color } = query;
    // const filter: any = {};

    // if (name) filter.name = { $regex: name, $options: "i" };
    // if (minPrice) filter.price = { ...filter.price, $gte: Number(minPrice) };
    // if (maxPrice) filter.price = { ...filter.price, $lte: Number(maxPrice) };
    // if (color) filter.color = color;

    const products = await ProductModel.find(filter);
    return products;
  } catch (error) {
    // throw new Error('Error searcing products')
    console.log(error)

  }
};
