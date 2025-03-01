import express from "express";
import { CreateWallet, GetWallet, FundWallet, DeductWallet, UpdateAccountDetails } from "../controllers/walletController";
import  identifier from "../middlewares/identification";

const routerWallet = express.Router();

routerWallet.post("/create-wallet", identifier, CreateWallet);
routerWallet.get("/get-wallet", identifier, GetWallet);
routerWallet.post("/fund-wallet", identifier, FundWallet);
routerWallet.post("/deduct-wallet", identifier, DeductWallet);
routerWallet.put("/update-wallet", identifier, UpdateAccountDetails);

export default routerWallet;
