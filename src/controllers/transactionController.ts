import { Request, Response } from "express";
import { createTransaction, getTransactionById, getAllTransactions } from "../services/transactionService";
import { initiateTransaction,createTransferRecipient, initiateWithdrawal,getBankCode } from '../utils/paystackUtils'
import transport from "../middlewares/sendMail";
import crypto from "crypto";
import fs from "fs";
import { getWallet, debitWallet, creditWallet } from "../services/walletService";
import { getOneByQuery } from "../services/authService";
import sendEmail from "../utils/sendMessage";

export const InitiateTransaction = async (req: Request, res: Response) => {
  try {
    const { product, buyerEmail,buyerName, seller, quantity,price, totalPrice, paymentMethod } = req.body;

    if (!product || !buyerEmail || !seller || !quantity || !price || !totalPrice || !paymentMethod) {
      res.status(400).json({ success: false, message: "Missing required fields" });
      return;
    }

    // Step 1: Initiate transaction with Paystack
    const paystackResponse = await initiateTransaction(product, buyerEmail,buyerName, seller, quantity,price, totalPrice, paymentMethod);

    if (!paystackResponse || !paystackResponse.data.authorization_url) {
      res.status(500).json({ success: false, message: "Failed to initiate transaction with Paystack" });
      return;
    }

    res.status(201).json({
      success: true,
      message: "Transaction initiated successfully",
      paymentUrl: paystackResponse.data.authorization_url, // Send payment link to frontend
    });

    return
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating transaction", error: error.message });
  }
};

export const InitiateWithdrawal = async (req: Request, res: Response) => {
  try {
    const { userId } = req.user; // Assuming user authentication middleware attaches userId to req.user
    const { amount } = req.body;
  
    if (!amount || amount <= 0) {
      res.status(400).json({ success: false, message: "Invalid amount" });
      return
    }
  
    // Step 1: Fetch user's wallet details
    const wallet = await getWallet(userId)
  
    if (!wallet) {
      res.status(404).json({ success: false, message: "Wallet not found" });
      return
    }
  
    if (wallet.balance < amount) {
      res.status(400).json({ success: false, message: "Insufficient balance" });
      return
    }
  
    const { bankName, accountNumber, accountHolderName } = wallet.accountDetails;
  
    // You will need to map the bank name to a Paystack bank code
    const bankCode = await getBankCode(bankName);
    console.log("BANK CODE: ", bankCode)
    if (!bankCode) {
      res.status(400).json({ success: false, message: "Invalid bank name" });
      return
    }
  
    // Step 2: Create transfer recipient using wallet's account details
    const recipientData = await createTransferRecipient(accountHolderName, accountNumber, bankCode.code);
    console.log("Recepient Data:",recipientData)
    const recipientCode = recipientData.data.recipient_code;
    console.log("Recipient Code",recipientCode)
    // Step 3: Initiate withdrawal
    const withdrawalData = await initiateWithdrawal(recipientCode, amount);

    res.status(201).json({
      success: true,
      message: "Withdrawal initiated",
      withdrawal: withdrawalData, // Send payment link to frontend
    });

    return
  } catch (error) {
    res.status(500).json({ success: false, message: "Error processing withdrawal", error: error.message });

  }
};

export const GetTransactionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const transaction = await getTransactionById(id);

    if (!transaction) {
      res.status(404).json({ success: false, message: "Transaction not found" });
      return
    }    
    

    res.status(200).json(transaction);
    return
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching transaction", error: error.message });
    return
  }
};

export const GetAllTransactions = async (req: Request, res: Response) => {
  try {
    const transactions = await getAllTransactions();
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching transactions", error: error.message });
  }
};

// export const UpdateTransactionStatus = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const { status } = req.body;

//     if (!status || !["pending", "completed", "failed"].includes(status)) {
//       res.status(400).json({ success: false, message: "Invalid transaction status" });
//       return
//     }

//     const updatedTransaction = await updateTransactionStatus(id, status);
//     res.status(200).json({ success: true, message: "Transaction updated", transaction: updatedTransaction });
//     return
//   } catch (error) {
//     res.status(500).json({ success: false, message: "Error updating transaction", error: error.message });
//     return
//   }
// };

export const PayStackWebhook = async (req: Request, res: Response) => {
  try {

    const PAYSTACK_IPS = [
      "52.31.139.75",
      "52.49.173.169",
      "52.214.14.220",
    ];
    
    const requestIP = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "";

    console.log("Incoming Webhook from IP:", requestIP);

    // 2️⃣ Verify IP is from Paystack
    if (!PAYSTACK_IPS.includes(requestIP as string)) {
      console.warn("🚨 Unauthorized IP:", requestIP);
      res.status(403).json({ success: false, message: "Forbidden: Invalid IP" });
      return
    }

    // 3️⃣ Validate Paystack Signature (To ensure request authenticity)
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return
    }

    const event = req.body;
    console.log("Paystack Webhook Event:", event); // Debugging logs
    
    if(req.body.event == 'charge.success'){
    const amount = req.body.data.amount
    let totalPrice = amount/100
    console.log(totalPrice)
    // ✅ Extract metadata from webhook response
    const metadata = event.data.metadata || {};
    const {
      product,
      buyerName,
      buyerEmail,
      seller,
      quantity,
      price,
      paymentMethod,
    } = metadata;

    
    
      const paymentId = event.data.reference;
      console.log("Payment Successful:", paymentId);


      console.log(buyerEmail,product)
      if (!buyerEmail || !product) {
        console.warn("🚨 Missing metadata in webhook event!");
        res.status(400).json({ success: false, message: "Missing metadata" });
        return;
      }
      totalPrice = amount / 100; // Convert kobo to Naira
      await createTransaction(product, buyerEmail,buyerName, paymentId, seller,quantity, price, totalPrice, paymentMethod);
      console.log(`✅ Payment successful for ${paymentId}`);
    


    fs.appendFileSync("../paystack_logs.txt", JSON.stringify(req.body, null, 2) + "\n");


    const message = "Your payment has been received"
    let info = await sendEmail(buyerEmail, buyerEmail,message)
    
  console.log(4,
      info.accepted[0], buyerEmail,
      info.accepted[0] === buyerEmail
  )
}
if(req.body.event == "transfer.success"){
  const { userId } = req.user; // Assuming user authentication middleware attaches userId to req.user
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    res.status(400).json({ success: false, message: "Invalid amount" });
    return
  }

  // Step 1: Fetch user's wallet details
  const wallet = await getWallet(userId)

  if (!wallet) {
    res.status(404).json({ success: false, message: "Wallet not found" });
    return
  }

  if (wallet.balance < amount) {
    res.status(400).json({ success: false, message: "Insufficient balance" });
    return
  }


 const debitedWallet = await debitWallet(userId,amount) 

  const user = await getOneByQuery({userId})
  const userEmail = user.email
  const message = "Your Withdrawal has been processed successfully"
  let info = await sendEmail(userEmail,user.username,message)
  
console.log(4,
    info.accepted[0], userEmail,
    info.accepted[0] === userEmail
)
}

else if (event.event === "transfer.failed") {
  console.log("❌ Withdrawal Failed:", event.data);
  // Handle failed withdrawal (refund user, notify admin, etc.)
  const { userId } = req.user; // Assuming user authentication middleware attaches userId to req.user
  const { amount } = req.body;
  const wallet = await getWallet(userId)

  if (!wallet) {
    res.status(404).json({ success: false, message: "Wallet not found" });
    return
  }
  
  await creditWallet(userId,amount)


}

    res.sendStatus(200); // Paystack expects a 200 response
    
  } catch (error) {
    res.status(500).json({ success: false, message: "Webhook processing failed" });
  }
};

