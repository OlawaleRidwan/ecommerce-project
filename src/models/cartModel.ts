import mongoose, { Schema, Document } from "mongoose";

export interface ICart extends Document {
  user: mongoose.Types.ObjectId;
  items: {
    product: mongoose.Types.ObjectId;
    quantity: number;
    price: number;
    total: number;
  }[];
  totalPrice: number;
}

const CartSchema: Schema = new Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: {type: Number,required: true},
        total: {type: Number,required: true}
      },
    ],
    totalPrice: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const CartModel = mongoose.model<ICart>("Cart", CartSchema);
export default CartModel;
