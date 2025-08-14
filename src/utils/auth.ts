// src/utils/auth.ts
import bcrypt from "bcryptjs";
import { sign } from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

// Функція для хешування пароля
export async function hashPassword(password: string): Promise<string> {
  const hashedPassword = await bcrypt.hash(password, 10);
  return hashedPassword;
}

// Функція для перевірки пароля
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Функція для генерації JWT токена
export function generateJWT(userId: string, email: string): string {
  return sign({ userId, email }, process.env.JWT_SECRET!, {
    expiresIn: "1h", // Термін дії токену
  });
}

export async function currentUser() {
  const cookieStore = await cookies();
  const id = cookieStore.get("user_id")?.value;
  if (!id) return null;

  return prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true },
  });
}
