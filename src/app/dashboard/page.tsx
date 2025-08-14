import React from "react";
import styles from "@/app/dashboard/dashboard.module.scss";
import YourTasks from "../component/YourTasks/page";

export default function Dashboard() {
  return (
    <div className={styles.Dashboard}>
      <h1 className={styles.titleMain}>
        TASK/
        <br />
        MANAGER/
      </h1>

      <div className={styles.TasksContainer}>
        <YourTasks />

        <section className={styles.panel}>
          <div className={styles.panelHead}>AVAILABLE TASKS</div>
          <div className={styles.panelBody}>{/* here available */}</div>
        </section>
      </div>
    </div>
  );
}
