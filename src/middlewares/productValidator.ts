import Joi from "joi";
import mongoose from "mongoose";
import { ProductCategory } from "../models/productModel";


// Define Joi validation schema
export const createProductSchema = Joi.object({
    name: Joi.string().trim().min(2).max(100).required().messages({
      "string.empty": "Product name is required",
      "string.min": "Product name must be at least 2 characters",
      "string.max": "Product name must not exceed 100 characters",
    }),
    price: Joi.number().min(0).required().messages({
      "number.base": "Price must be a number",
      "number.min": "Price must be a non-negative number",
      "any.required": "Price is required",
    }),
    quantity: Joi.number().integer().min(0).required().messages({
      "number.base": "Quantity must be a number",
      "number.integer": "Quantity must be an integer",
      "number.min": "Quantity must be at least 0",
      "any.required": "Quantity is required",
    }),
    cloudinaryUrls: Joi.array() // ✅ Add cloudinaryUrls validation
      .items(
        Joi.string().uri().messages({
          "string.uri": "Each Cloudinary URL must be a valid URL",
        })
      )
      .required()
      .messages({
        "array.base": "Cloudinary URLs must be an array of valid URLs",
      }),
    description: Joi.string().trim().max(500).optional().messages({
      "string.max": "Description must not exceed 500 characters",
    }),
    color: Joi.string().trim().max(50).optional(),
    size: Joi.string().trim().max(50).optional(),
    category: Joi.string()
    .valid(...Object.values(ProductCategory))
    .required()
    .messages({
      "any.only": `Invalid category. Allowed values: ${Object.values(ProductCategory).join(", ")}`,
      "any.required": "Category is required",
    })
    // user: Joi.string()
    //   .custom((value, helpers) => {
    //     if (!mongoose.Types.ObjectId.isValid(value)) {
    //       return helpers.error("any.invalid");
    //     }
    //     return value;
    //   })
    //   .required()
    //   .messages({
    //     "any.invalid": "Invalid user ID format",
    //     "any.required": "User ID is required",
    //   }),
  });


  export const updateProductSchema = Joi.object({
    name: Joi.string().trim().min(2).max(100).messages({
      "string.empty": "Product name is required",
      "string.min": "Product name must be at least 2 characters",
      "string.max": "Product name must not exceed 100 characters",
    }),
    price: Joi.number().min(0).messages({
      "number.base": "Price must be a number",
      "number.min": "Price must be a non-negative number",
      "any.required": "Price is required",
    }),
    quantity: Joi.number().integer().min(0).messages({
      "number.base": "Quantity must be a number",
      "number.integer": "Quantity must be an integer",
      "number.min": "Quantity must be at least 0",
      "any.required": "Quantity is required",
    }),
    cloudinaryUrls: Joi.array() // ✅ Add cloudinaryUrls validation
      .items(
        Joi.string().uri().messages({
          "string.uri": "Each Cloudinary URL must be a valid URL",
        })
      )
      .optional()
      .messages({
        "array.base": "Cloudinary URLs must be an array of valid URLs",
      }),
    description: Joi.string().trim().max(500).optional().messages({
      "string.max": "Description must not exceed 500 characters",
    }),
    color: Joi.string().trim().max(50).optional(),
    size: Joi.string().trim().max(50).optional(),
    category: Joi.string()
    .valid(...Object.values(ProductCategory))
    .messages({
      "any.only": `Invalid category. Allowed values: ${Object.values(ProductCategory).join(", ")}`,
      "any.required": "Category is required",
    }
  )
  });