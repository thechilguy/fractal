import { prisma } from "@/lib/prisma";
import { currentUser } from "@/utils/auth";
import { notFound, redirect } from "next/navigation";

type Params = { params: { todoId: string } };

export const revalidate = 0;

export default async function TodoDetailPage({ params }: Params) {
  const user = await currentUser();
  if (!user) redirect("/login");

  const todo = await prisma.todo.findFirst({
    where: { id: params.todoId, userId: user.id },
    select: {
      id: true,
      title: true,
      description: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!todo) return notFound();

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
        {todo.title}
      </h1>
      <div style={{ color: "#6b7280", marginBottom: 16 }}>
        Створено: {new Date(todo.createdAt).toLocaleString()}
        {" · Оновлено: "}
        {new Date(todo.updatedAt).toLocaleString()}
      </div>
      <p style={{ fontSize: 16, lineHeight: 1.6 }}>{todo.description}</p>
    </main>
  );
}
