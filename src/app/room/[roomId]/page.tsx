"use client";

import styles from "./RoomItem.module.scss";
import { FiUsers, FiCheckCircle, FiClock } from "react-icons/fi";

type Props = {
  id: string;
  name: string;
  tasksCount: number;
  ownerName: string;
  participants: number;
  capacity: number;
  status: "waiting" | "active" | "finished";
  onJoin?: (id: string) => void;
};

export default function RoomItem({
  id,
  name,
  tasksCount,
  ownerName,
  participants,
  capacity,
  status,
  onJoin,
}: Props) {
  const statusLabel =
    status === "waiting"
      ? "Waiting"
      : status === "active"
      ? "Active"
      : "Finished";

  return (
    <article
      className={`${styles.card} ${
        status === "active"
          ? styles.active
          : status === "finished"
          ? styles.finished
          : ""
      }`}
    >
      <div className={styles.header}>
        <h3 className={styles.title}>{name}</h3>
        <span className={`${styles.status} ${styles[status]}`}>
          {statusLabel}
        </span>
      </div>

      <div className={styles.meta}>
        <span className={styles.owner}>Owner: {ownerName}</span>
        <span className={styles.tasks}>Tasks: {tasksCount}</span>
      </div>

      <div className={styles.participants}>
        <FiUsers /> {participants}/{capacity}
      </div>

      <div className={styles.actions}>
        {status === "waiting" && (
          <button
            className={styles.joinBtn}
            onClick={() => onJoin && onJoin(id)}
          >
            Join
          </button>
        )}
        {status === "active" && (
          <span className={styles.inProgress}>
            <FiClock /> In Progress
          </span>
        )}
        {status === "finished" && (
          <span className={styles.done}>
            <FiCheckCircle /> Completed
          </span>
        )}
      </div>
    </article>
  );
}
