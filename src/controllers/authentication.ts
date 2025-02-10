import express from 'express';
import {UserModel, createUser,getUserById,getUsers } from '../models/userModel';
import jwt,{JwtPayload} from 'jsonwebtoken'
import { signupSchema, signinSchema, acceptCodeSchema, changePasswordSchema,acceptFPCodeSchema }  from "../middlewares/validator";
import { doHash, doHashValidation , hmacProcess} from "../utils/hashing";
import transport  from '../middlewares/sendMail'



export const signup = async(req: express.Request, res: express.Response) => {
    const {username,email, password, phone_number} = req.body;
    
    try {
        const {error, value} = signupSchema.validate(req.body)
        if (error) {
            res.status(401).json({success:false, message: error.details[0].message})
        }

        const existingUser = await UserModel.findOne({ $or: [ { email }, { phone_number }] });
        if(existingUser) {
            res.status(401).json({success: false, message: "User already exist!"})
        }
        
        const hashedPassword = await doHash(password, 10);
        const newUser = new UserModel({
            username,
            email,
            phone_number,
            password: hashedPassword,
        })
        
        const result = await newUser.save();
        result.password = undefined;
        

        res.status(201).json({
            success: true, message: "Your account has been created successfully",
            result,
        })

    } catch (error) {
        console.log(error)
    }
} 

export const signin = async (req:express.Request, res:express.Response) => {
    const {email,phone_number,password} = req.body;
    try {
        const {error,value} = signinSchema.validate({email,phone_number,password});
        if (error) {
            res
                .status(401)
                .json({success: false, message: error.details[0].message})
        }
        const existingUser = await UserModel.findOne({ $or: [ { email }, { phone_number }] }).select('+password')
        if(!existingUser) {
            res.status(401).json({success: false, message: "User does not exist!"});
        
        }
        const result = await doHashValidation(password, existingUser.password)
        if (!result) {
            res
            .status(401)
            .json({success: false, message: 'Incorrect Password!'});
        }
        const token = jwt.sign ({
            userId: existingUser._id,
            user_name: existingUser.username,
            verified: existingUser.verified,
        },
        process.env.TOKEN_SECRET,
        {
            expiresIn: '8h',
        }
    );
    res.cookie("Authorization", `Bearer ${token}`, {
        expires: new Date(Date.now() + 8 * 3600000), // 8 hours expiration
        httpOnly: process.env.NODE_ENV === "production",
        secure: process.env.NODE_ENV === "production",
      })
    .json({
        success : true,
        token,
        message: 'logged in successfully',
    })
    }   
    catch(error) {
        console.log(error)
    }
}

export const signout= async (req: express.Request, res:express.Response) => {
    res
    .clearCookie('Authorization')
    .status(200)
    .json({sucess: true, message: 'logged out successfully'})
}

export const sendVerificationCode = async (req: express.Request,res: express.Response) => {
    const {email,phone_number} = req.body;
    try {
        const existingUser = await UserModel.findOne({ $or: [ { email }, { phone_number }] });
        console.log(1)
        if(!existingUser) {
            res
            .status(404)
            .json({success: false, message: "User does not exist!"});
        
        }
        console.log(2)
        if(existingUser.verified) {
            res
            .status(404)
            .json({success: false, message: "You are already verified!"});
        }
        console.log(3)
        const codeValue = Math.floor(Math.random() * 1000000).toString()
        let info = await transport.sendMail({
            from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
            to: existingUser.email,
            subject: 'verification code',
            html: '<h1>' + codeValue + '</h1>'
        })
        console.log(4,
            info.accepted[0], existingUser.email,
            info.accepted[0] === existingUser.email
        )
        if(info.accepted[0] === existingUser.email) {
            const hashedCodeValue = hmacProcess(codeValue, process.env.
            HMAC_VERIFICATION_CODE_SECRET)
            console.log({ hashedCodeValue })
            existingUser.verificationCode = hashedCodeValue;
            existingUser.verificationCodeValidation = Date.now()
            await existingUser.save()
            res.status(200).json({success: true, message: 'Code Sent'})
        }
        else {
        res.status(400).json({success: false, message: 'Code Sent failed'})
        }
        console.log(5)
    } catch (error) {
         console.log(error)
    }
}

export const verifyVerificationCode = async (req: express.Request,res:express.Response) => {
    const {email,phone_number, providedCode} = req.body;
    console.log("body1",req.body)
    try {
        const {error,value} = acceptCodeSchema.validate({email,phone_number, providedCode });
        if (error) {
            res
                .status(401)
                .json({success: false, message: error.details[0].message})
        }
        const codeValue = providedCode.toString();
        const existingUser = await UserModel.findOne({ $or: [ { email }, { phone_number }] }).select("verificationCode verificationCodeValidation");
        if(!existingUser) {
            res
            .status(401)
            .json({success: false, message: "User does not exist!"});
        }

        if (existingUser.verified) {
            res.status(400).json({success: false, message: "you are already verified"});
        }
        console.log(
            existingUser.verificationCode, existingUser.verificationCodeValidation,
            !existingUser.verificationCode, !existingUser.verificationCodeValidation
        )
        if (!existingUser.verificationCode || !existingUser.verificationCodeValidation) {
            res
            .status(400)
            .json({success: false, message: "something is wrong with the code"});

        }
        if (Date.now() - existingUser.verificationCodeValidation > 5 * 60 * 1000) {
            res
            .status(400)
            .json({success: false, message: "code has been expired"});

        }
        const hashedCodeValue = hmacProcess(codeValue, process.env.
        HMAC_VERIFICATION_CODE_SECRET
        )  
        console.log({ hashedCodeValue })
        if (hashedCodeValue === existingUser.verificationCode) {
            existingUser.verified = true;
            existingUser.verificationCode = undefined;
            existingUser.verificationCodeValidation = undefined;
            await existingUser.save();
            res
            .status(200)
            .json({success: true, message: 'Your account has been verified'});
        }
        

    } catch (error) {
        console.log(error);
    }
};

export const changePassword = async(req: express.Request,res: express.Response)=> {
    const { userId, verified } = req.user 
    // as JwtPayload & { userId: string; verified: boolean };
    console.log(userId,verified)
    const {oldPassword, newPassword} = req.body;
    try {
        const {error,value} = changePasswordSchema.validate({oldPassword, newPassword });
        if (error) {
            res
                .status(401)
                .json({success: false, message: error.details[0].message})
        }  
        if (!verified) {
            res
            .status(403)
            .json({success: false, message: 'You are not a verified user'});
        } 
        const existingUser = await UserModel.findOne({_id: userId}).select('password');   
        if (!existingUser) {
            res
            .status(401)
            .json({success: false, message: 'User does not exists!'})

        }
        const result = await doHashValidation(oldPassword,existingUser.password)
        if (!result) {
            res
            .status(401)
            .json({success: false, message: 'Incorrect Old password!'});
        }
        const hashedPassword = await doHash(newPassword,10);
        existingUser.password = hashedPassword;
        await existingUser.save();
        res
            .status(200)
            .json({ success: true, message: 'Password updated!'});
    } catch(error) {
        console.log(error);
    }
}

export const sendForgotPasswordCode = async (req: express.Request,res: express.Response) => {
    const {email,phone_number} = req.body;
    try {
        const existingUser = await UserModel.findOne({ $or: [ { email }, { phone_number }] });
        if(!existingUser) {
            res
            .status(404)
            .json({success: false, message: "User does not exist!"});
        
        }

        const codeValue = Math.floor(Math.random() * 1000000).toString()
        let info = await transport.sendMail({
            from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
            to: existingUser.email,
            subject: 'Forgot password code',
            html: '<h1>' + codeValue + '</h1>'
        })
 
        if(info.accepted[0] === existingUser.email) {
            const hashedCodeValue = hmacProcess(codeValue, process.env.
            HMAC_VERIFICATION_CODE_SECRET)
            console.log({ hashedCodeValue })
            existingUser.forgotPasswordCode = hashedCodeValue;
            existingUser.forgotPasswordCodeValidation = Date.now()
            await existingUser.save()
            res.status(200).json({success: true, message: 'Code Sent'})
        }
        else{
        res.status(400).json({success: false, message: 'Code Sent failed'})
        }
        console.log(5)
    } catch (error) {
         console.log(error)
    }
}

export const verifyForgotPasswordCode = async (req:express.Request,res: express.Response) => {
    const {email,phone_number, providedCode, newPassword} = req.body;
    console.log("body1",req.body)
    try {
        const {error,value} = acceptFPCodeSchema.validate({email,phone_number, providedCode , newPassword});
        if (error) {
            res
                .status(401)
                .json({success: false, message: error.details[0].message})
        }
        const codeValue = providedCode.toString();
        const existingUser = await UserModel.findOne({ $or: [ { email }, { phone_number }] }).select(
            "forgotPasswordCode forgotPasswordCodeValidation");
        if(!existingUser) {
            res
            .status(401)
            .json({success: false, message: "User does not exist!"});
            return
        }
        
        console.log (
            existingUser.forgotPasswordCode, existingUser.forgotPasswordCodeValidation,
            !existingUser.forgotPasswordCode || !existingUser.forgotPasswordCodeValidation
        )
            if (!existingUser.forgotPasswordCode || !existingUser.forgotPasswordCodeValidation) {
            res
            .status(400)
            .json({success: false, message: "something is wrong with the code"});
            return
        }

        if (Date.now() - existingUser.forgotPasswordCodeValidation > 5 * 60 * 1000) {
            res
            .status(400)
            .json({success: false, message: "code has been expired"});
            return
        }
        const hashedCodeValue = hmacProcess(codeValue, process.env.
        HMAC_VERIFICATION_CODE_SECRET
        )  
        console.log({ hashedCodeValue })
        console.log(hashedCodeValue === existingUser.forgotPasswordCode)
        if (hashedCodeValue === existingUser.forgotPasswordCode) {
            const hashedPassword = await doHash(newPassword, 10);
            existingUser.password = hashedPassword;
            existingUser.forgotPasswordCode = undefined;
            existingUser.forgotPasswordCodeValidation = undefined;
            await existingUser.save();
            res
            .status(200)
            .json({success: true, message: 'Password updated'});
        }
        else{ 
        res.status(400).json({success:false, message: 'unexpected occured!'})
        }

    } catch (error) {
        console.log(error);
    }
};