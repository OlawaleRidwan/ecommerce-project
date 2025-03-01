import WalletModel from "../models/walletModel";
import mongoose from "mongoose";

export const createWallet = async (userId: string, bankName: string, accountNumber: string, accountHolderName: string) => {
  const existingWallet = await WalletModel.findOne({ user: userId });
  if (existingWallet) {
    return existingWallet;
  }
  return await WalletModel.create({
    user: userId,
    balance: 0,
    transactions: [],
    accountDetails: { bankName, accountNumber, accountHolderName },
  });
};

export const getWallet = async (userId: string) => {
  return await WalletModel.findOne({ user: userId }).populate("transactions");
};

export const creditWallet = async (userId: string, amount: number) => {
  if (amount <= 0) throw new Error("Amount must be greater than zero");

  const wallet = await WalletModel.findOneAndUpdate(
    { user: userId },
    { $inc: { balance: amount } },
    { new: true }
  );

  const updateWalletWithTransaction = async (userId: string, transactionId: string) => {
  try {
    const updatedWallet = await WalletModel.findOneAndUpdate(
      { user: new mongoose.Types.ObjectId(userId) }, // Find wallet by user ID
      { $push: { transactions: new mongoose.Types.ObjectId(transactionId) } }, // Add transaction ID to the array
      { new: true } // Return the updated document
    );

    if (!updatedWallet) {
      throw new Error("Wallet not found");
    }

    return updatedWallet;
  } catch (error) {
    console.error("Error updating wallet:", error);
    throw error;
  }
};

  return wallet;
};

export const updateWalletWithTransaction = async (userId: string, transactionId: string) => {
    try {
      const updatedWallet = await WalletModel.findOneAndUpdate(
        { user: new mongoose.Types.ObjectId(userId) }, // Find wallet by user ID
        { $push: { transactions: new mongoose.Types.ObjectId(transactionId) } }, // Add transaction ID to the array
        { new: true } // Return the updated document
      );
  
      if (!updatedWallet) {
        throw new Error("Wallet not found");
      }
  
      return updatedWallet;
    } catch (error) {
      console.error("Error updating wallet:", error);
      throw error;
    }
  };

export const debitWallet = async (userId: string, amount: number) => {
  const wallet = await getWallet(userId);
  if (!wallet) throw new Error("Wallet not found");

  if (wallet.balance < amount) throw new Error("Insufficient balance");

  wallet.balance -= amount;
  await wallet.save();
  return wallet;
};

export const updateAccountDetails = async (userId: string, bankName: string, accountNumber: string, accountHolderName: string) => {
  const wallet = await WalletModel.findOneAndUpdate(
    { user: userId },
    { accountDetails: { bankName, accountNumber, accountHolderName } },
    { new: true }
  );

  if (!wallet) throw new Error("Wallet not found");
  return wallet;
};
