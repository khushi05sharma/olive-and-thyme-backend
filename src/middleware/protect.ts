import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

// ------ EXTEND EXPRESS REQUEST TYPE -------
// by default req has: body, headers, params, query etc
// we need to ADD a user field so we can attach the logged-in user to it
// this tells TypeScript: req.user is allowed and has this shape

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string;
        email: string;
      };
    }
  }
}

const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer")) {
      console.log(`[PROTECT] Blocked >> no token on ${req.method} ${req.url}`);
      return res
        .status(401)
        .json({ message: "Not authorized - please login first" });
    }

    // extract token
    const token = authHeader.split(" ")[1];

    // verify token
    // if expired or tampered -> jwt.verify throws error -> caught below
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in .env file");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { id: string };

    // find user (just because a token is valid doesn't mean the user still exists)
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      console.log(`[PROTECT] Blocked >> user not found for token`);
      return res
        .status(401)
        .json({ message: "Not authorized — user not found" });
    }

    // attach user to request object
    // now any route using protect can access req.user
    // e.g. req.user.id to know who is saving/liking/commenting
    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    };
    // call next() to pass to actual route handler
    next();
  } catch (error: any) {
    console.error(`[PROTECT] Error: ${error.message}`);
    return res
      .status(401)
      .json({ message: "Not authorized — invalid or expired token" });
  }
};

export default protect;
