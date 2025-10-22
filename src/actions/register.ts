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
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return { success: false, error: "Користувач з таким email вже існує" };
    }

    const hashed = await hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
      },
    });

    return { success: true };
  } catch (err: any) {
    if (err?.code === "P2002") {
      return { success: false, error: "Email вже зайнятий" };
    }
    console.error("Register action error:", err);
    return { success: false, error: "Сталася помилка під час реєстрації" };
  }
}
