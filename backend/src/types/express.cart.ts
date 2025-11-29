import "express";

declare global {
  namespace Express {
    interface Request {
      cartIdentity?: {
        userId?: number;
        sessionId?: string;
      };
    }
  }
}

