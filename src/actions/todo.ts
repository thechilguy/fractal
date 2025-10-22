"use server";
import { currentUser } from "@/utils/auth";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
export async function createTodo(formData: FormData) {
  const user = await currentUser();
  if (!user) redirect("/login");

  const title = (formData.get("title") as string | null)?.trim() ?? "";
  const description =
    (formData.get("description") as string | null)?.trim() ?? "";
  const roomIdRaw = (formData.get("roomId") as string | null) ?? "";
  const from = (formData.get("from") as string | null) ?? "";

  if (title.length < 3 || title.length > 80) {
    return { error: "Title: 3–80 символів" };
  }
  if (description.length < 5 || description.length > 2000) {
    return { error: "Description: 5–2000 символів" };
  }

  const roomId = roomIdRaw.length ? roomIdRaw : null;

  if (roomId) {
    const canUseRoom = await prisma.room.findFirst({
      where: {
        id: roomId,
        OR: [
          { ownerId: user.id },
          {
            joinRequests: {
              some: { requesterId: user.id, status: "APPROVED" },
            },
          },
        ],
      },
      select: { id: true },
    });

    if (!canUseRoom) {
      return { error: "Немає доступу до цієї кімнати" };
    }
  }

  await prisma.todo.create({
    data: {
      title,
      description,
      userId: user.id,
      roomId,
    },
  });

  if (from) {
    revalidatePath(from);
  } else if (roomId) {
    revalidatePath(`/room/${roomId}`);
  } else {
    revalidatePath("/todos");
  }

  return { ok: true };
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

export async function subscribeTodo(formData: FormData) {
  const user = await currentUser();
  if (!user) redirect("/login");

  const todoId = (formData.get("todoId") as string) || "";
  const from = (formData.get("from") as string) || `/todos/${todoId}`;

  if (!todoId) return;

  const todo = await prisma.todo.findFirst({
    where: {
      id: todoId,
      OR: [
        { roomId: null, userId: user.id },
        {
          room: {
            OR: [
              { ownerId: user.id },
              {
                joinRequests: {
                  some: { requesterId: user.id, status: "APPROVED" },
                },
              },
            ],
          },
        },
      ],
    },
    select: { id: true },
  });
  if (!todo) return;

  await prisma.todoSubscription.upsert({
    where: { userId_todoId: { userId: user.id, todoId } },
    update: {},
    create: { userId: user.id, todoId },
  });

  revalidatePath(from);
}

export async function unsubscribeTodo(formData: FormData) {
  const user = await currentUser();
  if (!user) redirect("/login");

  const todoId = (formData.get("todoId") as string) || "";
  const from = (formData.get("from") as string) || `/todos/${todoId}`;

  if (!todoId) return;

  await prisma.todoSubscription.deleteMany({
    where: { userId: user.id, todoId },
  });

  revalidatePath(from);
}
