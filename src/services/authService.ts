import express from 'express';
import {IUser, UserModel } from '../models/userModel';
import jwt,{JwtPayload} from 'jsonwebtoken'
import { signupSchema, signinSchema, acceptCodeSchema, changePasswordSchema,acceptFPCodeSchema }  from "../middlewares/validator";
import { doHash, doHashValidation , hmacProcess} from "../utils/hashing";
import transport  from '../middlewares/sendMail'



export const signup = async(body: Partial<IUser> & { email_or_phone_number?: string }) => {
    const {username,email_or_phone_number, password} = body;
    
    try {        
        const hashedPassword = await doHash(password, 10);

        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email_or_phone_number);
        console.log(isEmail)
        console.log(email_or_phone_number)
        const newUser = new UserModel({
            username,
            email: isEmail ? email_or_phone_number : undefined, 
            phone_number: !isEmail ? email_or_phone_number : undefined,
            password: hashedPassword,
        });
        
        const result = await newUser.save();
        result.password = undefined;
        return result        

        // res.status(201).json({
        //     success: true, message: "Your account has been created successfully",
        //     result,
        // })

    } catch (error) {
        console.log(error)
    }
} 

export const getOneByQuery = async (filter: any,select?: string) => {

    try {
      console.log(filter)
      const product = await UserModel.findOne(filter).select(select)
      return product
    } catch (error) {
     throw new Error("Error getting product by seller");
  }

  };
  