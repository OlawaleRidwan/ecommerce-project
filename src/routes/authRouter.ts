import express from 'express';
import {Signup,Signin,signout,sendVerificationCode,verifyVerificationCode,changeUserDetails,sendForgotPasswordCode,verifyForgotPasswordCode} from '../controllers/authenticationController';
import  identifier from '../middlewares/identification';
const authRouter = express.Router();

authRouter.post('/signup', Signup)
authRouter.post('/signin',Signin) 
authRouter.post('/signout',identifier ,signout) 
authRouter.patch('/send-verification-code', identifier,sendVerificationCode);
authRouter.patch('/verify-verification-code',identifier,verifyVerificationCode);
authRouter.patch('/change-user-details',identifier,changeUserDetails);
authRouter.patch('/send-forgot-password-code',sendForgotPasswordCode);
authRouter.patch('/verify-forgot-password',verifyForgotPasswordCode);


export default authRouter