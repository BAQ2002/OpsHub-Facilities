"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Sidebar.module.css";

const facilitiesSubItems = [
  {
    label: "Acompanhamento",
    href: "/acompanhamento-atividades",
    icon: <ActivityIcon />,
  },
  {
    label: "Minhas solicitações",
    href: "/minhas-solicitacoes",
    icon: <RequestsIcon />,
  },
];

/**
 * Acionada pelo React quando o componente é incluído na árvore de renderização do componente pai.
 *
 * Renderiza o componente Sidebar com os dados recebidos.
 * Durante o fluxo, aciona {@link usePathname}, {@link map}, {@link startsWith}.
 *
 * @returns O elemento React que representa esta interface.
 */
export default function Sidebar() {
  const pathname = usePathname();
  const isFacilitiesHome = pathname === "/";

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

      <nav className={styles.nav} aria-label="Menu principal">
        <section className={styles.moduleGroup} aria-label="Módulo Facilities">
          <Link
            href="/"
            className={`${styles.moduleHeader} ${isFacilitiesHome ? styles.moduleHeaderActive : ""}`}
            aria-current={isFacilitiesHome ? "page" : undefined}
          >
            <span className={styles.moduleIcon}>
              <FacilitiesIcon />
            </span>
            <span className={styles.moduleText}>Facilities</span>
            <span className={styles.moduleChevron} aria-hidden="true">
              <ChevronUpIcon />
            </span>
          </Link>

          <div className={styles.subNav}>
            {facilitiesSubItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.subNavItem} ${isActive ? styles.subNavItemActive : ""}`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span className={styles.subNavIcon}>{item.icon}</span>
                  <span className={styles.subNavText}>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </section>
      </nav>
    </aside>
  );
}

/**
 * Acionada pelo React quando o componente é incluído na árvore de renderização do componente pai.
 *
 * Renderiza o ícone visual de facilities.
 *
 * @returns O elemento React que representa esta interface.
 */
function FacilitiesIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
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
  );
}

/**
 * Acionada pelo React quando o componente é incluído na árvore de renderização do componente pai.
 *
 * Renderiza o ícone visual de activity.
 *
 * @returns O elemento React que representa esta interface.
 */
function ActivityIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M4 19V5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M4 19H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <rect x="7" y="11" width="3" height="5" rx="1" stroke="currentColor" strokeWidth="1.8" />
      <rect x="12" y="8" width="3" height="8" rx="1" stroke="currentColor" strokeWidth="1.8" />
      <rect x="17" y="5" width="3" height="11" rx="1" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

/**
 * Acionada pelo React quando o componente é incluído na árvore de renderização do componente pai.
 *
 * Renderiza o ícone visual de requests.
 *
 * @returns O elemento React que representa esta interface.
 */
function RequestsIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M9 5h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9 3h6a1 1 0 0 1 1 1v2H8V4a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M8 5H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M8 12h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M8 16h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Acionada pelo React quando o componente é incluído na árvore de renderização do componente pai.
 *
 * Renderiza o ícone visual de chevron up.
 *
 * @returns O elemento React que representa esta interface.
 */
function ChevronUpIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m18 15-6-6-6 6" />
    </svg>
  );
}
