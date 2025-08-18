"use client";

import { useState, useRef, useEffect } from "react";
import { createRoom } from "@/actions/rooms";
import styles from "./AddRoom.module.scss";
import { FaPlus } from "react-icons/fa";
import { IoCloseCircleOutline } from "react-icons/io5";

export default function AddRoom() {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const submitForm = () => {
    formRef.current?.requestSubmit();
    setOpen(false);
  };

  return (
    <>
      <div className={styles.headerPart}>
        <h1 className={styles.header}>Available Room</h1>
        <button className={styles.AddRoomButton} onClick={() => setOpen(true)}>
          <FaPlus /> Add Room
        </button>
      </div>

      {open && (
        <div className={styles.BlurOverlay} onClick={() => setOpen(false)}>
          <div className={styles.Modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.ModalHeader}>
              <h3>Create Room</h3>
              <button
                className={styles.CloseButton}
                onClick={() => setOpen(false)}
              >
                <IoCloseCircleOutline size={22} />
              </button>
            </div>

            <form ref={formRef} action={createRoom} className={styles.Form}>
              <input type="hidden" name="from" value="/room" />
              <input
                name="name"
                placeholder="Room name"
                minLength={3}
                maxLength={80}
                required
                className={styles.Input}
              />

              <div className={styles.Actions}>
                <button
                  type="button"
                  className={styles.CreateButton}
                  onClick={submitForm}
                >
                  Create
                </button>
                <button
                  type="button"
                  className={styles.CancelButton}
                  onClick={() => setOpen(false)}
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
}
