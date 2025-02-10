import express from 'express';
import {signup,signin,signout,sendVerificationCode,verifyVerificationCode,changePassword,sendForgotPasswordCode,verifyForgotPasswordCode} from '../controllers/authentication';
import  identifier from '../middlewares/identification';
const router = express.Router();

router.post('/signup', signup)
router.post('/signin',signin) 
router.post('/signout',identifier ,signout) 
router.patch('/send-verification-code', identifier,sendVerificationCode);
router.patch('/verify-verification-code',identifier,verifyVerificationCode);
router.patch('/change-password',identifier,changePassword);
router.patch('/send-forgot-password-code',sendForgotPasswordCode);
router.patch('/verify-forgot-password-code',verifyForgotPasswordCode);

// router.post('/signup', (req, res) => {
//     signup(req, res); // Same for the login handler
// })
// router.post('/signin', (req, res) => {
//     signin(req, res); // Same for the login handler
// })
// router.post('/signout',identifier as express.RequestHandler, (req, res) => {
//     signout(req, res); // Same for the login handler
// })
// router.patch('/send-verification-code',identifier as express.RequestHandler, (req, res) => {
//     sendVerificationCode(req, res); // Same for the login handler
// })
// router.patch('/verify-verification-code',identifier, (req, res) => {
//     verifyVerificationCode(req, res); // Same for the login handler
// })
// router.patch('/change-password',identifier, (req, res) => {
//     changePassword(req, res); // Same for the login handler
// })
// router.patch('/send-forgot-password-code',identifier, (req, res) => {
//     sendForgotPasswordCode(req, res); // Same for the login handler
// })
// router.patch('/verify-forgot-password-code',identifier, (req, res) => {
//     verifyForgotPasswordCode(req, res); // Same for the login handler
// })
export default router