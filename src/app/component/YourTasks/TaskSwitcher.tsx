"use client";

import { useState, useMemo } from "react";
import styles from "./YourTasks.module.scss";
import TodoItem from "@/app/component/Todo/TodoItem";

type TodoDTO = {
  id: string;
  title: string;
  description: string | null;
  createdAt: string | Date;
  isDone: boolean;
  roomId: string | null;
  room: { id: string; name: string } | null;
};

type Props = {
  personal: TodoDTO[];
  followed: TodoDTO[];
};

export default function TaskSwitcher({ personal, followed }: Props) {
  const [tab, setTab] = useState<"personal" | "rooms">("personal");

  const activeList = useMemo(
    () => (tab === "personal" ? personal : followed),
    [tab, personal, followed]
  );

  return (
    <>
      <div className={styles.switchBar} role="tablist" aria-label="Task type">
        <button
          role="tab"
          aria-selected={tab === "personal"}
          className={`${styles.tab} ${
            tab === "personal" ? styles.tabActive : ""
          }`}
          onClick={() => setTab("personal")}
        >
          Personal <span className={styles.counter}>{personal.length}</span>
        </button>
        <button
          role="tab"
          aria-selected={tab === "rooms"}
          className={`${styles.tab} ${tab === "rooms" ? styles.tabActive : ""}`}
          onClick={() => setTab("rooms")}
        >
          Room Task <span className={styles.counter}>{followed.length}</span>
        </button>
      </div>

      {activeList.length === 0 ? (
        <div className={styles.empty}>
          {tab === "personal"
            ? "Немає персональних задач"
            : "Немає підписаних задач з кімнат. Відкрий кімнату та натисни “Follow” на потрібній задачі."}
        </div>
      ) : (
        <div className={styles.todoContainer}>
          {activeList.map((t) => (
            <TodoItem
              key={t.id}
              todo={
                {
                  ...t,
                  createdAt: t.createdAt,
                } as any
              }
            />
          ))}
        </div>
      )}
    </>
  );
}
