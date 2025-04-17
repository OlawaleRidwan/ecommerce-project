import { v4 as uuidv4 } from "uuid";
import { Request, Response } from "express";
import redisClient from "../utils/redisClient";

const CACHE_EXPIRATION =  5 * 60; // 5 minutes expiration

// ✅ Get or create a guest cart ID and store it in cookies
export const getGuestCartId = (req: Request, res: Response): string => {
  if (!req.cookies.guestCartId) {
    const guestCartId = uuidv4();
    res.cookie("guestCartId", guestCartId, { httpOnly: true, maxAge: CACHE_EXPIRATION * 1000 });
    return guestCartId;
  }
  return req.cookies.guestCartId;
};

// ✅ Get guest cart from Redis
export const getGuestCart = async (cartId: string) => {
  const cart = await redisClient.get(`guestCart:${cartId}`);
  return cart ? JSON.parse(cart) : { items: [], totalPrice: 0 };
};

// ✅ Save guest cart to Redis
export const saveGuestCart = async (cartId: string, cartData: any) => {
  await redisClient.setEx(`guestCart:${cartId}`, CACHE_EXPIRATION, JSON.stringify(cartData));
};

// ✅ Add an item to the guest cart
export const addToGuestCart = async (cartId: string, productId: string, quantity: number, price: number) => {
  
  let cart = await getGuestCart(cartId);

  // Check if item already exists in the cart
  const existingItem = cart.items.find((item: any) => item.product === productId);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({ product: productId, quantity, price, total: quantity * price });
  }

  // Update total price
  cart.totalPrice = cart.items.reduce((sum: number, item: any) => sum + item.quantity * item.price, 0);

  // Save updated cart to Redis
  await saveGuestCart(cartId, cart);

  return cart;
};

// ✅ Remove an item from the guest cart
export const removeFromGuestCart = async (cartId: string, productId: string) => {
  let cart = await getGuestCart(cartId);

  cart.items = cart.items.filter((item: any) => item.product !== productId);

  // Update total price
  cart.totalPrice = cart.items.reduce((sum: number, item: any) => sum + item.quantity * item.price, 0);

  // Save updated cart to Redis
  await saveGuestCart(cartId, cart);

  return cart;
};

// ✅ Clear guest cart
interface Cart {
  items: { product: string; quantity: number; price: number; total: number }[];
  totalPrice: number;
}

export const clearGuestCart = async (cartId: string): Promise<Cart> => {
  await redisClient.del(`guestCart:${cartId}`);
  return { items: [], totalPrice: 0 };
};

