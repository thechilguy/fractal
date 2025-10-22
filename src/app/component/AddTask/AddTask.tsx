"use client";

import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { createTodo } from "@/actions/todo";
import styles from "./AddTask.module.scss";
import { FaPlus } from "react-icons/fa";
import { IoCloseCircleOutline } from "react-icons/io5";

const schema = yup.object({
  title: yup
    .string()
    .trim()
    .min(3, "Мінімум 3 символи")
    .max(80, "Макс. 80")
    .required("Обов'язкове поле"),
  description: yup
    .string()
    .trim()
    .min(5, "Мінімум 5 символів")
    .max(2000, "Макс. 2000")
    .required("Обов'язкове поле"),
});

type FormValues = yup.InferType<typeof schema>;

type Props = { roomId?: string };

const AddTask: React.FC<Props> = ({ roomId }) => {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: { title: "", description: "" },
    mode: "onSubmit",
  });

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const submitValid = () => {
    formRef.current?.requestSubmit();
    setOpen(false);
    reset({ title: "", description: "" });
  };

  const openModal = () => setOpen(true);
  const closeModal = () => {
    setOpen(false);
    reset({ title: "", description: "" });
  };

  return (
    <>
      <button className={styles.AddTaskButton} onClick={openModal}>
        <FaPlus /> Add Task
      </button>

      {open && (
        <div className={styles.BlurOverlay} onClick={closeModal}>
          <div
            className={styles.AddTodoForm}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.formHeader}>
              <h1>New Task</h1>
              <button
                className={styles.CloseButton}
                onClick={closeModal}
                aria-label="Close"
              >
                <IoCloseCircleOutline />
              </button>
            </div>

            <form
              ref={formRef}
              action={createTodo}
              noValidate
              className={styles.Form}
            >
              {roomId && <input type="hidden" name="roomId" value={roomId} />}

              <div className={styles.Field}>
                <label htmlFor="title">Title</label>
                <input
                  id="title"
                  placeholder="Implement server actions"
                  {...register("title")}
                  name="title"
                />
                {errors.title && (
                  <p className={styles.Error}>{errors.title.message}</p>
                )}
              </div>

              <div className={styles.Field}>
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  placeholder="Create, toggle, delete; revalidate list and detail pages."
                  rows={4}
                  {...register("description")}
                  name="description"
                />
                {errors.description && (
                  <p className={styles.Error}>{errors.description.message}</p>
                )}
              </div>

              <div className={styles.Actions}>
                <button
                  type="button"
                  className={styles.Submit}
                  disabled={isSubmitting}
                  onClick={handleSubmit(submitValid)}
                >
                  {isSubmitting ? "Creating..." : "Create"}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className={styles.Cancel}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AddTask;
