import Joi from "joi";

export const signupSchema = Joi.object({
  email_or_phone_number: Joi.alternatives().try(
    Joi.string().email({ tlds: { allow: false } }), // Email validation
    Joi.string().pattern(/^\d{10,15}$/).message("Invalid phone number format") // Phone number validation (10-15 digits)
  ).required().messages({
    "alternatives.match": "Must be a valid email or phone number",
    "any.required": "Email or phone number is required",
  }),

  username: Joi.string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_.]+$/)
    .message("Username can only contain letters, numbers, underscores, and dots")
    .required()
    .messages({
      "string.empty": "Username is required",
      "string.min": "Username must be at least 3 characters",
      "string.max": "Username must not exceed 30 characters",
    }),

  password: Joi.string()
    .min(8)
    .max(50)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
    .message("Password must contain at least one uppercase, one lowercase, one number, and one special character")
    .required()
    .messages({
      "string.empty": "Password is required",
      "string.min": "Password must be at least 8 characters",
      "string.max": "Password must not exceed 50 characters",
    }),
});

// export const signinSchema = Joi.object({
//     email: Joi.string()
//         .min(6)
//         .max(60)
//         .optional()
//         .email({
//             tlds: { allow: ['com', 'net']},
//         })
//         .trim(),
//     phone_number: Joi.string()
//         .pattern(/^[0-9]{10,15}$/)
//         .optional()
//         .messages({ "string.pattern.base": "Phone number must be 10-15 digits." }),
//     password: Joi.string()
//         .required()
//         .pattern( new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*d).{8,}$'))
// }).xor("email", "phone_number");


export const signinSchema = Joi.object({
    email_or_phone_number: Joi.alternatives().try(
      Joi.string().email({ tlds: { allow: false } }), // Email validation
      Joi.string().pattern(/^\d{10,15}$/).message("Invalid phone number format") // Phone number validation (10-15 digits)
    ).required().messages({
      "alternatives.match": "Must be a valid email or phone number",
      "any.required": "Email or phone number is required",
    }),
  
    password: Joi.string()
      .min(8)
      .max(50)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
      .message("Password must contain at least one uppercase, one lowercase, one number, and one special character")
      .required()
      .messages({
        "string.empty": "Password is required",
        "string.min": "Password must be at least 8 characters",
        "string.max": "Password must not exceed 50 characters",
      }),
  });
  

export const acceptCodeSchema = Joi.object({
    email_or_phone_number: Joi.alternatives().try(
        Joi.string().email({ tlds: { allow: false } }), // Email validation
        Joi.string().pattern(/^\d{10,15}$/).message("Invalid phone number format") // Phone number validation (10-15 digits)
      ).required().messages({
        "alternatives.match": "Must be a valid email or phone number",
        "any.required": "Email or phone number is required",
      }),
    providedCode: Joi.number()
})

export const changePasswordSchema = Joi.object({
    newPassword: Joi.string()
      .min(8)
      .max(50)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
      .message("Password must contain at least one uppercase, one lowercase, one number, and one special character")
      .messages({
        "string.empty": "Password is required",
        "string.min": "Password must be at least 8 characters",
        "string.max": "Password must not exceed 50 characters",
      }),
      oldPassword: Joi.string()
      .min(8)
      .max(50)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
      .message("Password must contain at least one uppercase, one lowercase, one number, and one special character")
      .messages({
        "string.empty": "Password is required",
        "string.min": "Password must be at least 8 characters",
        "string.max": "Password must not exceed 50 characters",
      }),
      firstName: Joi.string().min(2).max(50).optional(),
      lastName: Joi.string().min(2).max(50).optional(),
      address: Joi.string().min(5).max(255).optional(),
}).with("newPassword", "oldPassword").with("oldPassword", "newPassword");

export const acceptFPCodeSchema = Joi.object({
    email_or_phone_number: Joi.alternatives().try(
        Joi.string().email({ tlds: { allow: false } }), // Email validation
        Joi.string().pattern(/^\d{10,15}$/).message("Invalid phone number format") // Phone number validation (10-15 digits)
      ).required().messages({
        "alternatives.match": "Must be a valid email or phone number",
        "any.required": "Email or phone number is required",
      }),
    providedCode: Joi.number(),
    newPassword: Joi.string()
      .min(8)
      .max(50)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
      .message("Password must contain at least one uppercase, one lowercase, one number, and one special character")
      .required()
      .messages({
        "string.empty": "Password is required",
        "string.min": "Password must be at least 8 characters",
        "string.max": "Password must not exceed 50 characters",
      })
});
