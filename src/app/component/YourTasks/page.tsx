// app/component/YourTasks/page.tsx
import styles from "@/app/component/YourTasks/YourTasks.module.scss";
import TodoItem from "@/app/component/Todo/TodoItem";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/utils/auth";
import { redirect } from "next/navigation";
import AddTask from "../AddTask/AddTask";

// завжди свіжі дані для користувацьких списків
export const revalidate = 0;

export default async function YourTasks() {
  const user = await currentUser();
  if (!user) redirect("/login");

  const todos = await prisma.todo.findMany({
    where: { userId: user.id }, // ← ключове: тільки свої
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      createdAt: true,
      isDone: true,
    },
  });

  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <p>YOUR TASKS</p>
        <AddTask />
      </div>

      <div className={styles.panelBody}>
        <div className={styles.todoContainer}>
          {todos.length === 0 ? (
            <div className={styles.empty}>Немає задач</div>
          ) : (
            todos.map((t) => <TodoItem key={t.id} todo={t} />)
          )}
        </div>
      </div>
    </section>
  );
}
