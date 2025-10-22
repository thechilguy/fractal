import styles from "./YourTasks.module.scss";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/utils/auth";
import AddTask from "@/app/component/AddTask/AddTask";
import TaskSwitcher from "./TaskSwitcher";

export const revalidate = 0;

export default async function YourTasks() {
  const user = await currentUser();
  if (!user) return null;

  const personal = await prisma.todo.findMany({
    where: { userId: user.id, roomId: null },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      createdAt: true,
      isDone: true,
      roomId: true,
      room: { select: { id: true, name: true } },
    },
  });

  const subscriptions = await prisma.todoSubscription.findMany({
    where: { userId: user.id },
    select: {
      todo: {
        select: {
          id: true,
          title: true,
          description: true,
          createdAt: true,
          isDone: true,
          roomId: true,
          room: { select: { id: true, name: true } },
        },
      },
    },
  });

  const followed = subscriptions
    .map((s) => s.todo)
    .filter((t, idx, arr) => arr.findIndex((x) => x.id === t.id) === idx)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <p>YOUR TASKS</p>
        <AddTask />
      </div>

      <div className={styles.switchWrapper}>
        <TaskSwitcher personal={personal as any} followed={followed as any} />
      </div>
    </section>
  );
}
