import Joi from "joi";

export const walletSchema = Joi.object({
  user: Joi.string()
    .required()
    .regex(/^[0-9a-fA-F]{24}$/) // Ensures valid MongoDB ObjectId
    .message("Invalid user ID format"),

  balance: Joi.number()
    .min(0)
    .default(0)
    .message("Balance must be a positive number"),

  transactions: Joi.array()
    .items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)) // Ensures valid MongoDB ObjectId for transactions
    .message("Invalid transaction ID format"),

  accountDetails: Joi.object({
    bankName: Joi.string().trim().required().message("Bank name is required"),
    accountNumber: Joi.string()
      .trim()
      .pattern(/^\d{10,20}$/) // Ensures a valid numeric account number (10-20 digits)
      .required()
      .message("Invalid account number format"),
    accountHolderName: Joi.string().trim().required().message("Account holder name is required"),
  }).required(),
});
