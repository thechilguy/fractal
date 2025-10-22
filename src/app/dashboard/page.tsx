import React from "react";
import styles from "@/app/dashboard/dashboard.module.scss";
import YourTasks from "../component/YourTasks/page";
import RoomBox from "../room/page";

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
          <div className={styles.headerPart}>
            <RoomBox />
          </div>

          <div className={styles.panelBody}></div>
        </section>
      </div>
    </div>
  );
}
