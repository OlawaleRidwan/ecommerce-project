import CartModel from "../models/cartModel";
import ProductModel from "../models/productModel";
import mongoose from "mongoose";
import Redis from "ioredis";
import redisClient from "../utils/redisClient";


export const addToCart = async (userId: string, productId: string, quantity: number, price: number) => {
  try {
    const cacheKey = `cart:${userId}`;

    // 1️⃣ Fetch cart from database
    let cart = await CartModel.findOne({ user: userId });

    if (!cart) {
      cart = await CartModel.create({ user: userId, items: [], totalPrice: 0 });
    }

    // 2️⃣ Check if product already exists in cart
    const existingItem = cart.items.find((item) => item.product.toString() === productId);

    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.total = existingItem.quantity * existingItem.price;
    } else {
      cart.items.push({ 
        product: new mongoose.Types.ObjectId(productId), 
        quantity, 
        price,
        total: quantity * price 
      });
    }

    // 3️⃣ Recalculate total price
    cart.totalPrice = cart.items.reduce((sum, item) => sum + item.total, 0);

    // 4️⃣ Save to database
    await cart.save();

    // 5️⃣ Update cache with new cart data
    await redisClient.set(cacheKey, JSON.stringify(cart));

    return cart;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const removeFromCart = async (userId: string, productId: string) => {
  try {
    const cacheKey = `cart:${userId}`;

    // 1️⃣ Update the database first
    const cart = await CartModel.findOneAndUpdate(
      { user: userId },
      { $pull: { items: { product: productId } } },
      { new: true }
    );

    if (!cart) throw new Error("Cart not found");

    // 2️⃣ Recalculate total price
    cart.totalPrice = cart.items.reduce((sum, item) => sum + item.total, 0);
    await cart.save();

    // 3️⃣ Update the cache with the new cart
    await redisClient.set(cacheKey, JSON.stringify(cart));

    return cart;
  } catch (error) {
    throw new Error(error.message);
  }
};

// export const getCart = async (userId: string) => {
//   return await CartModel.findOne({ user: userId }).populate("items");
// };


const CACHE_EXPIRATION = 5 * 60 ; // 2 hours cache expiration

export const getCart = async (userId: string) => {
  const cacheKey = `cart:${userId}`;

  // 1️⃣ Check Redis cache first
  const cachedCart = await redisClient.get(cacheKey);
  if (cachedCart) {
    return JSON.parse(cachedCart);
  }

  // 2️⃣ Fetch cart from MongoDB
  const cart = await CartModel.findOne({ user: userId });

  if (!cart) {
    return { items: [], totalPrice: 0 };
  }

  // 3️⃣ Fetch all product details in one query using MongoDB `$lookup`
  const cartItems = await CartModel.aggregate([
    { $match: { user: userId } },
    { $unwind: "$items" },
    {
      $lookup: {
        from: "products",
        localField: "items.product",
        foreignField: "_id",
        as: "productDetails",
      },
    },
    { $unwind: "$productDetails" },
    {
      $project: {
        product: "$items.product",
        quantity: "$items.quantity",
        name: "$productDetails.name",
        image: "$productDetails.image",
        price: "$productDetails.price",
        total: { $multiply: ["$items.quantity", "$productDetails.price"] },
      },
    },
  ]);

  // 4️⃣ Calculate total price
  const totalPrice = cartItems.reduce((sum, item) => sum + item.total, 0);

  // 5️⃣ Cache the result in Redis for faster future requests
  const cartData = { items: cartItems, totalPrice };
  await redisClient.set(cacheKey, JSON.stringify(cartData));
  
  return cartData;
};

export const clearCart = async (userId: string) => {
  // 1️⃣ Clear the cart in the database
  const updatedCart = await CartModel.findOneAndUpdate(
    { user: userId },
    { items: [], totalPrice: 0 },
    { new: true }
  );

  // 2️⃣ Remove the cart from Redis cache
  const cacheKey = `cart:${userId}`;
  await redisClient.del(cacheKey);

  return updatedCart;
};