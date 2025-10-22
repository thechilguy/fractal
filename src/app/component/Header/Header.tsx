export const dynamic = "force-dynamic";

import styles from "./Header.module.scss";
import { LuSquareStack } from "react-icons/lu";
import { currentUser } from "@/utils/auth";
import Link from "next/link";

export default async function Header() {
  const user = await currentUser();
  return (
    <div className={styles.headerContainer}>
      <div className={styles.logo}>
        <div className={styles.logoIcon}>
          <LuSquareStack />
        </div>
        <Link href="/" className={styles.logoText}>
          Fractal
        </Link>
      </div>

      <div className={styles.avatarStyles}>
        {user ? (
          <>
            <Link href={"/userProfile"}>
              <span className={styles.userName}>{user.name ?? user.email}</span>
            </Link>
          </>
        ) : (
          <Link href="/login" className={styles.loginLink}>
            Login
          </Link>
        )}
      </div>
    </div>
  );
}
