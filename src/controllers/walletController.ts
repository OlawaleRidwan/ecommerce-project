import { Request, Response } from "express";
import {
  createWallet,
  getWallet,
  creditWallet,
  debitWallet,
  updateAccountDetails,
} from "../services/walletService";
import { getBankCode, resolveAccountNumber } from "../utils/paystackUtils";

export const CreateWallet = async (req: Request, res: Response) => {
  try {
    const { userId } = req.user;
    const { bankName, accountNumber } = req.body;

    if (!bankName || !accountNumber) {
      res.status(400).json({ success: false, message: "Bank name and account number are required" });
      return
    }

    // Get the list of banks from Paystack
    
    const bank = await getBankCode(bankName)

    if (!bank) {
      res.status(400).json({ success: false, message: "Invalid bank name" });
      return
    }

    // Resolve account number to get the account holder's name
    const accountInfo = await resolveAccountNumber(accountNumber, bank.code);
    if (!accountInfo) {
      res.status(400).json({ success: false, message: "Invalid account number" });
      return
    }

    const wallet = await createWallet(userId, bankName, accountNumber, accountInfo.account_name);
    res.status(201).json({ success: true, message: "Wallet created", wallet });
    return
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating wallet", error });
    return
  }
};

export const GetWallet = async (req: Request, res: Response) => {
  try {
    const { userId } = req.user;
    const wallet = await getWallet(userId);
    res.status(200).json(wallet);
    return
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching wallet", error });
    return
  }
};

export const FundWallet = async (req: Request, res: Response) => {
  try {
    const { userId } = req.user;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      res.status(400).json({ success: false, message: "Invalid amount" });
      return
    }

    const updatedWallet = await creditWallet(userId, amount);
    res.status(200).json({ success: true, message: "Wallet funded", wallet: updatedWallet });
    return
  } catch (error) {
    res.status(500).json({ success: false, message: "Error funding wallet", error });
    return
  }
};

export const DeductWallet = async (req: Request, res: Response) => {
  try {
    const { userId } = req.user;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      res.status(400).json({ success: false, message: "Invalid amount" });
      return
    }

    const updatedWallet = await debitWallet(userId, amount);
    res.status(200).json({ success: true, message: "Wallet debited", wallet: updatedWallet });
    return
  } catch (error) {
    res.status(500).json({ success: false, message: "Error debiting wallet", error });
    return
  }
};

export const UpdateAccountDetails = async (req: Request, res: Response) => {
  try {
    const { userId } = req.user;
    const { bankName, accountNumber } = req.body;

    if (!bankName || !accountNumber) {
      res.status(400).json({ success: false, message: "Bank name and account number are required" });
      return
    }

    // Get the list of banks from Paystack
    
    const bank = await getBankCode(bankName)
    console.log(bank); 
    // Output: { name: "Guaranty Trust Bank", code: "058" }
    

    if (!bank) {
      res.status(400).json({ success: false, message: "Invalid bank name" });
      return
    }

    // Resolve account number to get the account holder's name
    const accountInfo = await resolveAccountNumber(accountNumber, bank.code);
    if (!accountInfo) {
      res.status(400).json({ success: false, message: "Invalid account number" });
      return
    }

    const updatedWallet = await updateAccountDetails(userId, bankName, accountNumber, accountInfo.account_name);
    res.status(200).json({ success: true, message: "Account details updated", wallet: updatedWallet });
    return
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating account details", error });
    return;
  }
};
