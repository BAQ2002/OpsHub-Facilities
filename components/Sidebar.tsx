"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Sidebar.module.css";

const menuItems = [
  {
    label: "Facilities",
    href: "/",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="0.5" y="0.5" width="13" height="23" rx="1.5" stroke="currentColor" />
        <rect x="14.5" y="10.5" width="9" height="13" rx="1.5" stroke="currentColor" />
        <rect x="2.5" y="3.5" width="3" height="3" rx="1" stroke="currentColor" />
        <rect x="8.5" y="3.5" width="3" height="3" rx="1" stroke="currentColor" />
        <rect x="8.5" y="8.5" width="3" height="3" rx="1" stroke="currentColor" />
        <rect x="8.5" y="13.5" width="3" height="3" rx="1" stroke="currentColor" />
        <rect x="16.5" y="13.5" width="5" height="3" rx="1" stroke="currentColor" />
        <rect x="5.5" y="18.5" width="3" height="5" rx="1" stroke="currentColor" />
        <rect x="17.5" y="18.5" width="3" height="5" rx="1" stroke="currentColor" />
        <rect x="2.5" y="13.5" width="3" height="3" rx="1" stroke="currentColor" />
        <rect x="2.5" y="8.5" width="3" height="3" rx="1" stroke="currentColor" />
        <path d="M12 23.5H16" stroke="currentColor" />
        <line x1="13" y1="22.5" x2="15" y2="22.5" stroke="currentColor" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <button className={styles.collapseButton} type="button" aria-label="Recolher menu">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      </div>

      <nav className={styles.nav}>
        {menuItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${isActive ? styles.active : ""}`}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navText}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}