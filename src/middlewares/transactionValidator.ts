import Joi from "joi";

export const transactionSchema = Joi.object({
  product: Joi.string()
    .required()
    .regex(/^[0-9a-fA-F]{24}$/) // Ensures valid MongoDB ObjectId
    .message("Invalid product ID format"),
  
  buyerEmail: Joi.string()
    .email({ tlds: { allow: false } }) // Validates email format
    .required()
    .message("Invalid email format"),

  paymentId: Joi.string()
    .required()
    .trim()
    .message("Payment ID is required"),

  seller: Joi.string()
    .required()
    .regex(/^[0-9a-fA-F]{24}$/) // Ensures valid MongoDB ObjectId
    .message("Invalid seller ID format"),

  quantity: Joi.number()
    .integer()
    .min(1)
    .required()
    .message("Quantity must be at least 1"),

  totalPrice: Joi.number()
    .min(0)
    .required()
    .message("Total price must be a positive number"),

  status: Joi.string()
    .valid("pending", "completed", "failed")
    .default("pending")
    .message("Invalid transaction status"),

  paymentMethod: Joi.string()
    .valid("card", "paypal", "crypto", "bank_transfer")
    .required()
    .message("Invalid payment method"),
});
