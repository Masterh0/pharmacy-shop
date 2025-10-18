import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { prisma } from "../config/db";

// تعریف تایپ برای payload توکن JWT
interface JwtPayload {
  id: number;
  role: 'ADMIN' | 'STAFF' | 'CUSTOMER';
}

// گسترش دادن نوع Request برای اضافه کردن user
declare global {
  namespace Express {
    interface Request {
      user: JwtPayload;
    }
  }
}

const verifyAccessToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid access token' });
  }
};

const verifyRefreshToken = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.body.refreshToken;
  if (!token) return res.status(401).json({ error: 'No refresh token provided' });

  try {
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!) as { id: number };
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if(!user) return res.status(401).json({error:'user not found'})
    req.user = { id: user.id, role: user.role };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};

const checkRole = (roles: Array<'ADMIN' | 'STAFF' | 'CUSTOMER'>) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: `Access denied. Requires ${roles.join(' or ')} role` });
  }
  next();
};

export { verifyAccessToken,verifyRefreshToken, checkRole };