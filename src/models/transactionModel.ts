import mongoose, { Schema, Document } from "mongoose";

interface ITransaction extends Document {
  product: mongoose.Types.ObjectId;
  buyerEmail: string;
  buyerName: string;
  paymentId: string;
  seller: mongoose.Types.ObjectId;
  quantity: number;
  price: number,
  totalPrice: number;
  status: "pending" | "completed" | "failed";
  paymentMethod: "card" | "paypal" | "crypto" | "bank_transfer";

}

const TransactionSchema: Schema = new Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    buyerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"], // Basic email validation
    },
    buyerName: {type: String, required: [true, 'Username is required'],trim: true},
    paymentId: { type: String, required: true, unique: true }, // Ensures no duplicate transactions
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["card", "paypal", "crypto", "bank_transfer"],
      required: true,
    },
  },
  { timestamps: true }
);

const TransactionModel = mongoose.model<ITransaction>("Transaction", TransactionSchema);

export default TransactionModel;
