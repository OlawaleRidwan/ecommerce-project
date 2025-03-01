import mongoose, { Schema, Document } from "mongoose";

export interface IWallet extends Document {
  user: mongoose.Types.ObjectId;
  balance: number;
  transactions: mongoose.Types.ObjectId[];
  accountDetails: {
    bankName: string;
    accountNumber: string;
    accountHolderName: string;
  };
}

const WalletSchema: Schema = new Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true, required: true },
    balance: { type: Number, default: 0, min: 0 },
    transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Transaction" }],
    accountDetails: {
      bankName: { type: String, required: true },
      accountNumber: { type: String, required: true },
      accountHolderName: { type: String, required: true },
    },
  },
  { timestamps: true }
);

const WalletModel = mongoose.model<IWallet>("Wallet", WalletSchema);
export default WalletModel;
