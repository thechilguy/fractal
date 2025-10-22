"use client";

import { logout } from "@/actions/logout";

export default function LogoutButton() {
  const confirmLogout = () => {
    return confirm("Вийти з облікового запису?");
  };

  return (
    <form
      action={logout}
      onSubmit={(e) => !confirmLogout() && e.preventDefault()}
    >
      <button
        type="submit"
        style={{
          padding: "8px 16px",
          background: "#ef4444",
          color: "#fff",
          borderRadius: "6px",
        }}
      >
        Logout
      </button>
    </form>
  );
}
