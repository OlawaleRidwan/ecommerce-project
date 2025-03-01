import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;



export const getBankList = async () => {

  if (!process.env.PAYSTACK_SECRET_KEY) {
    throw new Error("PAYSTACK_SECRET_KEY is missing. Check your .env file.");
  }
  

  try {
    const response = await axios.get("https://api.paystack.co/bank", {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
    });

    return response.data.data; // Returns list of banks with their codes
  } catch (error) {
    console.error("Error fetching bank list:", error.response?.data || error.message);
  }
};


export const getBankCode = async (bankName: string) => {
  
  const bankList = await getBankList();
  try {
        
    if (!bankList) throw new Error("Failed to fetch bank list from Paystack");
  } catch (error) {
    console.error("Error fetching bank list:", error);
  }
const bank = bankList?.find((b: any) => b.name.toLowerCase() === bankName.toLowerCase());
return bank

} 
export const resolveAccountNumber = async (accountNumber: string, bankCode: string) => {
    try {
      const response = await axios.get(
        `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
        {
          headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
        }
      );
  
      return response.data.data; // Contains account_name and account_number
    } catch (error) {
      console.error("Error resolving account:", error.response?.data || error.message);
    }
  };
  
  export const initiateTransaction = async (product:string, buyerEmail:string,buyerName:string, seller:string, quantity:number,price:number, totalPrice:number, paymentMethod:string) => {
    try {
      
      const amount = Math.round(totalPrice * 100); // Convert to Kobo
      const email = buyerEmail
      console.log(price,totalPrice)

      if (amount <= 0 || quantity <=0) {
        throw new Error("Amount or quantity must be greater than zero.");
      }
  

      const response = await axios.post(
        "https://api.paystack.co/transaction/initialize",
        {
          
          email,
          amount,
          currency: "NGN",
          callback_url: "www.google.com", // Your callback URL

          metadata: {
            product,
            buyerEmail,
            buyerName,
            seller,
            quantity,
            price,
            paymentMethod,
          }
        },
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log(2)
      
      return response.data; // Returns the payment authorization URL
    } catch (error) {
      console.error("Error initiating transaction:", error.response?.data || error.message);
      throw new Error("Transaction initialization failed");
    }
  };


export const createTransferRecipient = async (name: string, accountNumber: string, bankCode: string) => {
  try {
    const response = await axios.post(
      "https://api.paystack.co/transferrecipient",
      {
        type: "nuban", // Nigerian bank account
        name,
        account_number: accountNumber,
        bank_code: bankCode,
        currency: "NGN",
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data; // Contains recipient code
  } catch (error) {
    console.error("Error creating transfer recipient:", error.response?.data || error.message);
    throw new Error("Transfer recipient creation failed");
  }
};


export const initiateWithdrawal = async (recipientCode: string, amount: number) => {
  try {

    console.log("Inside withrdawal Util")
    const response = await axios.post(
      "https://api.paystack.co/transfer",
      {
        source: "balance",
        amount: amount * 100, // Convert to kobo
        recipient: recipientCode,
        reason: "User withdrawal",
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response.data)

    return response.data; // Contains transfer details
  } catch (error) {
    console.error("Error initiating withdrawal:", error.response?.data || error.message);
    throw new Error("Withdrawal initiation failed");
  }
};
