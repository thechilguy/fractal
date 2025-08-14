"use server";
import { currentUser } from "@/utils/auth";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function createTodo(formData: FormData) {
  const user = await currentUser();
  if (!user) redirect("/login");

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  if (!title || !description) return;

  await prisma.todo.create({
    data: {
      title,
      description,
      userId: user.id, // ← ключове
    },
  });

  revalidatePath("/todos");
}

export async function toggleTodo(formData: FormData) {
  const user = await currentUser();
  if (!user) redirect("/login");

  const id = (formData.get("id") as string) || "";
  const next = formData.get("next") as string;
  const from = (formData.get("from") as string) || "/todos";

  if (!id || (next !== "true" && next !== "false")) return;

  const res = await prisma.todo.updateMany({
    where: { id, userId: user.id },
    data: { isDone: next === "true" },
  });

  revalidatePath(from);
}

export async function updateTodo(formData: FormData) {
  const user = await currentUser();
  if (!user) redirect("/login");

  const id = (formData.get("id") as string) ?? "";
  const title = (formData.get("title") as string)?.trim() ?? "";
  const description = (formData.get("description") as string)?.trim() ?? "";

  if (!id || title.length < 3 || title.length > 80) return;
  if (description.length < 5 || description.length > 2000) return;

  await prisma.todo.updateMany({
    where: { id, userId: user.id },
    data: { title, description },
  });

  revalidatePath("/todos");
  revalidatePath(`/todos/${id}`);
}

export async function deleteTodo(formData: FormData) {
  const user = await currentUser();
  if (!user) redirect("/login");

  const id = formData.get("id") as string;
  if (!id) return;

  await prisma.todo.deleteMany({
    where: { id, userId: user.id },
  });

  revalidatePath("/todos");
}
