import Joi from "joi";
export const signupSchema = Joi.object({
    username: Joi.string()
    .min(3)
    .max(30)
    .required(),
    email: Joi.string()
        .min(6)
        .max(60)
        .optional()
        .email({
            tlds: { allow: ['com', 'net']},
        })
        .trim(),
    password: Joi.string()
        .required()
        .pattern( new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*d).{8,}$')),
    phone_number: Joi.string()
    .pattern(/^[0-9]{10,15}$/)
    .optional()
    .messages({ "string.pattern.base": "Phone number must be 10-15 digits." })
}).xor("email", "phone_number");

export const signinSchema = Joi.object({
    email: Joi.string()
        .min(6)
        .max(60)
        .optional()
        .email({
            tlds: { allow: ['com', 'net']},
        })
        .trim(),
    phone_number: Joi.string()
        .pattern(/^[0-9]{10,15}$/)
        .optional()
        .messages({ "string.pattern.base": "Phone number must be 10-15 digits." }),
    password: Joi.string()
        .required()
        .pattern( new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*d).{8,}$'))
}).xor("email", "phone_number");

export const acceptCodeSchema = Joi.object({
    email: Joi.string()
        .min(6)
        .max(60)
        .optional()
        .email({
            tlds: { allow: ['com', 'net']},
        })
        .trim(),
    phone_number: Joi.string()
        .pattern(/^[0-9]{10,15}$/)
        .optional()
        .messages({ "string.pattern.base": "Phone number must be 10-15 digits." }),
    providedCode: Joi.number()
}).xor("email", "phone_number");

export const changePasswordSchema = Joi.object({
    newPassword: Joi.string()
        .required()
        .pattern( new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*d).{8,}$')),
    oldPassword: Joi.string()
        .required()
        .pattern( new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*d).{8,}$'))

})

export const acceptFPCodeSchema = Joi.object({
    email: Joi.string()
    .min(6)
    .max(60)
    .optional()
    .email({
        tlds: { allow: ['com', 'net']},
    })
    .trim(),
    phone_number: Joi.string()
        .pattern(/^[0-9]{10,15}$/)
        .optional()
        .messages({ "string.pattern.base": "Phone number must be 10-15 digits." }),
    providedCode: Joi.number(),
    newPassword: Joi.string()
        .required()
        .pattern( new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*d).{8,}$'))
}).xor("email", "phone_number");
