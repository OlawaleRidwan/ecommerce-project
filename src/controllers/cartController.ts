import { Request, Response } from "express";
import { addToCart, removeFromCart, getCart, clearCart } from "../services/cartService";
import { getGuestCartId, getGuestCart,addToGuestCart, removeFromGuestCart, clearGuestCart } from "../services/guestCartService";


export const addToCartController = async (req: Request, res: Response) => {
  try {
    console.log(0)
    if (req.user && req.user.userId) {
      console.log(10)
    const userId = req.user?.userId; // Assuming req.user is populated from authentication middleware
    const { productId, quantity,price } = req.body;
    console.log(userId)

    
    if (!productId || quantity <= 0) {
      res.status(400).json({ success: false, message: "Invalid input" });
      return
    }

    const cart = await addToCart(userId, productId, quantity,price);
    res.status(200).json({ success: true, cart });
    return
  }

  else {
    console.log(1)
    let cartId = getGuestCartId(req,res)
    console.log(2)
    const { productId, quantity,price } = req.body;
    console.log(3)
    console.log("poductId:",productId)
    if (!productId || quantity <= 0) {
      res.status(400).json({ success: false, message: "Invalid input" });
      return
    }
    console.log(4)
    const cart = await addToGuestCart(cartId, productId, quantity,price);
    console.log(5)
    res.status(200).json({ success: true, cart });
    return
  }


  } 
  catch (error) {
    res.status(500).json({ success: false, message: error.message });
    return
  }
};

export const removeFromCartController = async (req: Request, res: Response) => {
  try {

    if (req.user && req.user.userId) {
 
    const userId = req.user?.userId;
    const { productId } = req.body;

    if (!productId) {
      res.status(400).json({ success: false, message: "Invalid input" });
      return
    }

    const cart = await removeFromCart(userId, productId);
    res.status(200).json({ success: true, cart });
    return
  }
  else {
    let cartId = getGuestCartId(req,res)
    const { productId } = req.body;

    if (!productId) {
      res.status(400).json({ success: false, message: "Invalid input" });
      return
    }

    const cart = await removeFromGuestCart(cartId, productId);
    res.status(200).json({ success: true, cart });
    return
  }

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
    return
  }
};

export const getCartController = async (req: Request, res: Response) => {
  try {

    const userId = req.user?.userId
console.log(userId)
    if (req.user && req.user.userId) {
  
      // res.status(400).json({ success: false, message: "User ID is required" });

      const cart = await getCart(userId);
      res.status(200).json({ success: true, cart });
      return
    }

    else {
      let cartId = getGuestCartId(req,res)
      const cart = await getGuestCart(cartId);
      res.status(200).json({ success: true, cart });
      return
    }

      } catch (error) {
    res.status(500).json({ success: false, message: error.message });
    return
  }
};

export const clearCartController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (userId) {

    
    if (!userId) {
      res.status(400).json({ success: false, message: "User ID is required" });
      return
    }

    const cart = await clearCart(userId);
    res.status(200).json({ success: true, message: "Cart cleared", cart });
    return
  }

  else {

    let cartId = getGuestCartId(req,res)
    const cart = await clearGuestCart(cartId);
    res.status(200).json({ success: true, message: "Cart cleared", cart });
    return

  }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
    return
  }
};
