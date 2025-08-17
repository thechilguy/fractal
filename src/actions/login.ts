"use server";

import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import { cookies } from "next/headers";

export async function loginUser(
  emailRaw: string,
  password: string
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    if (!emailRaw || !password) {
      return { success: false, error: "Всі поля обов'язкові" };
    }

    const email = emailRaw.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.password) {
      return { success: false, error: "Невірні облікові дані" };
    }

    const ok = await compare(password, user.password);
    if (!ok) {
      return { success: false, error: "Невірні облікові дані" };
    }

    cookies().set("user_id", user.id, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return { success: true };
  } catch (e) {
    console.error("loginUser action error:", e);
    return { success: false, error: "Сталася помилка. Спробуйте ще раз." };
  }
}
