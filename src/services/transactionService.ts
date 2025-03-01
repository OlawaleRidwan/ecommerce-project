import TransactionModel from "../models/transactionModel";
import WalletModel from "../models/walletModel";
import ProductModel from "../models/productModel"
import mongoose from "mongoose";
import { getWallet,creditWallet,updateWalletWithTransaction } from "./walletService";
import { getProductById,updateProductQuantityById } from "./productService";
export const createTransaction = async (
  product: string,
  buyerEmail: string,
  buyerName: string,
  paymentId: string,
  seller: string,
  quantity: number,
  price: number,
  totalPrice: number,
  paymentMethod: "card" | "paypal" | "crypto" | "bank_transfer",
) => {
  // Check if the product exists
  const existingProduct = await getProductById(product)
  if (!existingProduct){ 
    throw new Error("Product not found");

    return
    }

  // Check if the seller exists
  const sellerWallet = await getWallet(seller)
  if (!sellerWallet) {
    throw new Error("Seller wallet not found")
    return
};

  // Create transaction
  const transaction = await TransactionModel.create({
    product,
    buyerEmail,
    buyerName,
    paymentId,
    seller,
    quantity,
    price,
    totalPrice,
    status: "completed",
    paymentMethod,
  });

  const updatedProduct =await updateProductQuantityById(product,quantity);
  const updatedWalletBalance =await creditWallet(seller,price)
  const transactionId = transaction._id as string
  console.log(transactionId)
  const updatedWalletTransaction = await updateWalletWithTransaction(seller,transactionId)
  await sellerWallet.save();
  await existingProduct.save();

  return transaction;
};

export const getTransactionById = async (transactionId: string) => {
  return await TransactionModel.findById(transactionId).populate("product seller");
};

export const getAllTransactions = async () => {
  return await TransactionModel.find().populate("product seller");
};

// export const updateTransactionStatus = async (paymentId: string, status: "pending" | "completed" | "failed",amountPaid:number) => {
//   const transaction = await TransactionModel.findById(paymentId);
//   if (!transaction) throw new Error("Transaction not found");

//   transaction.status = status;
//   await transaction.save();

//   // If transaction is completed, credit seller's wallet
//   if (status === "completed") {
//     const sellerWallet = await WalletModel.findOne({ user: transaction.seller });
//     if (!sellerWallet) throw new Error("Seller wallet not found");

//     sellerWallet.balance += amountPaid;
//     await sellerWallet.save();
//   }

//   return transaction;
// };
