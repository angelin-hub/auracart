import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../db";
import { users, carts } from "../db/schema";
import { eq } from "drizzle-orm";
import { AppError } from "../middleware/errorHandler";

const signToken = (payload: { id: string; email: string; role: string; name: string }) =>
  jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as any,
  });

export const register = async (req: Request, res: Response): Promise<void> => {
  const { email, password, name } = req.body;

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);

  if (existing.length > 0) {
    throw new AppError(409, "Email already registered");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const [user] = await db
    .insert(users)
    .values({
      email: email.toLowerCase(),
      passwordHash,
      name,
      role: "user",
    })
    .returning({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
    });

  // Create an empty cart for new user
  await db.insert(carts).values({ userId: user.id });

  const token = signToken(user);

  res.status(201).json({
    success: true,
    message: "Account created successfully",
    data: { user, token },
  });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new AppError(401, "Invalid email or password");
  }

  const token = signToken({
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  });

  res.json({
    success: true,
    message: "Login successful",
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
      },
      token,
    },
  });
};

export const getMe = async (req: Request & { user?: any }, res: Response): Promise<void> => {
  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      avatar: users.avatar,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, req.user.id))
    .limit(1);

  res.json({ success: true, data: { user } });
};

export const updateProfile = async (req: Request & { user?: any }, res: Response): Promise<void> => {
  const { name, avatar } = req.body;

  const [updated] = await db
    .update(users)
    .set({ name, avatar, updatedAt: new Date() })
    .where(eq(users.id, req.user.id))
    .returning({
      id: users.id,
      email: users.email,
      name: users.name,
      avatar: users.avatar,
      role: users.role,
    });

  res.json({ success: true, data: { user: updated } });
};

export const changePassword = async (req: Request & { user?: any }, res: Response): Promise<void> => {
  const { currentPassword, newPassword } = req.body;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, req.user.id))
    .limit(1);

  if (!(await bcrypt.compare(currentPassword, user.passwordHash))) {
    throw new AppError(400, "Current password is incorrect");
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await db
    .update(users)
    .set({ passwordHash, updatedAt: new Date() })
    .where(eq(users.id, req.user.id));

  res.json({ success: true, message: "Password updated successfully" });
};
