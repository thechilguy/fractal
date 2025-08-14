"use server";

import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

type RegisterResult = { success: true } | { success: false; error: string };

export async function registerUser(
  name: string,
  email: string,
  password: string
): Promise<RegisterResult> {
  try {
    // 1) Перевірка, що такого емейлу ще нема
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return { success: false, error: "Користувач з таким email вже існує" };
    }

    // 2) Хеш пароля
    const hashed = await hash(password, 10);

    // 3) Створення користувача
    // УВАГА: id НЕ передаємо — у тебе він @default(auto()) для MongoDB
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
      },
    });

    return { success: true };
  } catch (err: any) {
    // Унікальний індекс email (на всякий) — Prisma P2002
    if (err?.code === "P2002") {
      return { success: false, error: "Email вже зайнятий" };
    }
    console.error("Register action error:", err);
    return { success: false, error: "Сталася помилка під час реєстрації" };
  }
}
