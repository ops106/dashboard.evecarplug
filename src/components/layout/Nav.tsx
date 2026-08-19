"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/login/logout-action";

type NavLink = { href: string; label: string; hint?: string; interneOnly?: boolean };

const NAV_GROUPS: { label?: string; links: NavLink[] }[] = [
  {
    links: [{ href: "/", label: "Tableau de bord" }],
  },
  {
    label: "Locations",
    links: [
      { href: "/locations", label: "Locations" },
      { href: "/mouvements-locatifs", label: "Mouvements locatifs" },
    ],
  },
  {
    label: "Demandes",
    links: [
      { href: "/suivi-demandes", label: "Suivi des demandes" },
      { href: "/clients", label: "Clients", interneOnly: true },
    ],
  },
];

export function Nav({ role }: { role?: "interne" | "partenaire_location" }) {
  const pathname = usePathname();
  const groups = NAV_GROUPS.map((group) => ({
    ...group,
    links: group.links.filter((link) => !link.interneOnly || role === "interne"),
  })).filter((group) => group.links.length > 0);

  return (
    <aside
      className="flex flex-col"
      style={{
        width: 240,
        flexShrink: 0,
        background: "var(--color-surface)",
        borderRight: "1px solid var(--color-divider)",
        position: "sticky",
        top: 0,
        height: "100vh",
        overflowY: "auto",
      }}
    >
      <div style={{ padding: "24px 20px" }}>
        <Link href="/">
          <Image src="/evecarplug-logo.svg" alt="EVE CAR PLUG" width={110} height={49} priority />
        </Link>
      </div>
      <nav className="flex flex-col" style={{ padding: "0 12px", flex: 1, gap: 20 }}>
        {groups.map((group) => (
          <div key={group.label ?? group.links[0].href} className="flex flex-col gap-1">
            {group.label && <span className="nav-section-label">{group.label}</span>}
            {group.links.map((link) => {
              const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <div key={link.href}>
                  <Link href={link.href} className="nav-sidebar-link" aria-current={isActive ? "page" : undefined}>
                    {link.label}
                  </Link>
                  {link.hint && <span className="nav-sidebar-hint">{link.hint}</span>}
                </div>
              );
            })}
          </div>
        ))}
      </nav>
      <form action={logoutAction} style={{ padding: 20 }}>
        <button type="submit" className="btn btn-secondary" style={{ width: "100%" }}>
          Se déconnecter
        </button>
      </form>
    </aside>
  );
}
