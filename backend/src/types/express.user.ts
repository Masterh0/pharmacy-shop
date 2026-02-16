import "express";

export type UserRole = "ADMIN" | "STAFF" | "CUSTOMER";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        role: UserRole;
      };
    }
  }
}

export {};
