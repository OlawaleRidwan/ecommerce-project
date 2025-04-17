import express from "express";
import { addToCartController, removeFromCartController, getCartController, clearCartController } from "../controllers/cartController";
import identifier from "../middlewares/identification";

const cartRouter = express.Router();

// Wrapper middleware to conditionally apply 'identifier'
const optionalIdentifier = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    let authToken
    if(req.headers.client === 'not-browser') {
        authToken = req.headers.authorization
   } else {
    authToken = req.cookies['Authorization']
   }
  
    if (authToken) {
      return identifier(req, res, next);
    }
    console.log("Identifier skipped")
    next();
  
  };

cartRouter.post("/add-to-cart", optionalIdentifier, addToCartController);
cartRouter.patch("/remove-from-cart", optionalIdentifier, removeFromCartController);
cartRouter.get("/get-cart", optionalIdentifier, getCartController);
cartRouter.delete("/clear-cart", optionalIdentifier, clearCartController);

export default cartRouter;
