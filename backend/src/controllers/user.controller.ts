import { prisma } from "../config/db";
import bcrypt from "bcryptjs";
import { Request, Response } from "express";


const createUserByAdmin = async (req: Request, res: Response) => {
  const { phone, email, password, role } = req.body;
  const allowedRoles = ["ADMIN", "STAFF", "CUSTOMER"];

  if (!role || !allowedRoles.includes(role))
    return res.status(400).json({ error: "Invalid role" });

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { phone, email, password: hashedPassword, role },
  });

  res.json({ message: "User created", user });
};

export { createUserByAdmin };
