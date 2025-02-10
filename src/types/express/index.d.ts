import { JwtPayload } from "jsonwebtoken";

declare global {
 export namespace Express {
    interface Request {
      user?: JwtPayload & { userId: string; verified: boolean };
    }
  }
}