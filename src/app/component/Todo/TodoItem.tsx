"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./TodoItem.module.scss";
import type { Todo } from "@prisma/client";
import { toggleTodo, deleteTodo, updateTodo } from "@/actions/todo";
import {
  FiCheckCircle,
  FiCircle,
  FiEdit2,
  FiTrash2,
  FiSave,
  FiX,
} from "react-icons/fi";

type Props = {
  todo: Pick<Todo, "id" | "title" | "description" | "createdAt" | "isDone">;
};

export default function TodoItem({ todo }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description);

  return (
    <article className={`${styles.card} ${todo.isDone ? styles.done : ""}`}>
      <div className={styles.left}>
        {/* Toggle */}
        <form action={toggleTodo}>
          <input type="hidden" name="id" value={todo.id} />
          <input type="hidden" name="next" value={(!todo.isDone).toString()} />
          <button
            type="submit"
            className={styles.toggleBtn}
            aria-label={todo.isDone ? "Mark as not done" : "Mark as done"}
            title={todo.isDone ? "Mark as not done" : "Mark as done"}
          >
            {todo.isDone ? <FiCheckCircle /> : <FiCircle />}
          </button>
        </form>

        <div className={styles.content}>
          <Link href={`/todos/${todo.id}`} className={styles.title}>
            {title}
          </Link>
          <div className={styles.desc}>{description}</div>
          <div className={styles.meta}>
            <span className={styles.chip}>
              {new Date(todo.createdAt).toLocaleDateString()}
            </span>
            <span
              className={`${styles.status} ${
                todo.isDone ? styles.ok : styles.progress
              }`}
            >
              {todo.isDone ? "Done" : "In progress"}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        {!isEditing ? (
          <>
            <button
              type="button"
              className={styles.iconBtn}
              onClick={() => setIsEditing(true)}
              aria-label="Edit"
              title="Edit"
            >
              <FiEdit2 />
            </button>

            <form
              action={deleteTodo}
              onSubmit={(e) => {
                if (!confirm("Видалити задачу?")) e.preventDefault();
              }}
            >
              <input type="hidden" name="id" value={todo.id} />
              <button
                type="submit"
                className={`${styles.iconBtn} ${styles.danger}`}
                aria-label="Delete"
                title="Delete"
              >
                <FiTrash2 />
              </button>
            </form>
          </>
        ) : (
          <>
            <form
              className={styles.inlineForm}
              action={updateTodo}
              onSubmit={() => setIsEditing(false)}
            >
              <input type="hidden" name="id" value={todo.id} />
              <input
                name="title"
                className={styles.input}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                minLength={3}
                maxLength={80}
                required
              />
              <textarea
                name="description"
                className={styles.textarea}
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                minLength={5}
                maxLength={2000}
                required
              />
              <button
                type="submit"
                className={`${styles.iconBtn} ${styles.primary}`}
                aria-label="Save"
                title="Save"
              >
                <FiSave />
              </button>
            </form>

            <button
              type="button"
              className={styles.iconBtn}
              onClick={() => {
                setIsEditing(false);
                setTitle(todo.title);
                setDescription(todo.description);
              }}
              aria-label="Cancel edit"
              title="Cancel"
            >
              <FiX />
            </button>
          </>
        )}
      </div>
    </article>
  );
}
