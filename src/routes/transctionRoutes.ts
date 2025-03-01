import express from "express";
import { GetTransactionById, GetAllTransactions, PayStackWebhook, InitiateTransaction, InitiateWithdrawal } from "../controllers/transactionController";
import identifier from "../middlewares/identification";

const transactionRouter = express.Router();

transactionRouter.post("/initiate-transaction", InitiateTransaction);
transactionRouter.post("/create-transaction", express.json(),PayStackWebhook);

transactionRouter.get("/get-a-transaction/:id",identifier,GetTransactionById);
transactionRouter.get("/get-all-transcation",identifier,GetAllTransactions);
transactionRouter.post("/initiate-withdrawal",identifier,InitiateWithdrawal)

export default transactionRouter;
