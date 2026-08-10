import Image from "next/image";
import Link from "next/link";
import { logoutAction } from "@/app/login/logout-action";

const LINKS = [
  { href: "/", label: "Tableau de bord" },
  { href: "/locations", label: "Locations" },
  { href: "/suivi-demandes", label: "Suivi des demandes" },
  { href: "/clients", label: "Clients" },
];

export function Nav() {
  return (
    <header style={{ background: "var(--color-surface)", borderBottom: "1px solid var(--color-divider)" }}>
      <div className="nav mx-auto max-w-7xl flex-wrap px-4 py-4">
        <Link href="/" className="nav-brand">
          <Image src="/evecarplug-logo.svg" alt="EVE CAR PLUG" width={110} height={49} priority />
        </Link>
        <nav className="flex flex-wrap gap-5">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
        <form action={logoutAction} className="ml-4">
          <button type="submit" className="btn btn-secondary" style={{ padding: "8px 18px" }}>
            Se déconnecter
          </button>
        </form>
      </div>
    </header>
  );
}
