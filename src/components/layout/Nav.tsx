"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logoutAction } from "@/app/login/logout-action";
import { setViewAsPartnerAction } from "@/lib/view-as-actions";

type Role = "interne" | "partenaire_location" | "apporteur_affaire";

// roles absent = visible pour tout le monde (ex. Tableau de bord, Suivi des
// demandes). roles present = liste blanche explicite des personas autorisées.
type NavLink = { href: string; label: string; hint?: string; roles?: Role[] };

const NAV_GROUPS: { label?: string; links: NavLink[] }[] = [
  {
    links: [{ href: "/", label: "Tableau de bord" }],
  },
  {
    label: "Locations",
    links: [
      { href: "/locations", label: "Locations", roles: ["interne", "partenaire_location"] },
      { href: "/mouvements-locatifs", label: "Mouvements locatifs", roles: ["interne", "partenaire_location"] },
    ],
  },
  {
    label: "Suivi & gestion",
    links: [
      { href: "/suivi-demandes", label: "Suivi des demandes" },
      { href: "/facturation", label: "Facturation", roles: ["interne", "partenaire_location"] },
    ],
  },
  {
    label: "Partie interne",
    links: [
      { href: "/clients", label: "Clients", roles: ["interne"] },
      { href: "/indicateurs", label: "KPI utilisation", roles: ["interne"] },
    ],
  },
];

export function Nav({
  role,
  isPartner = false,
  isApporteur = false,
  viewAsEmail,
  partnerContacts = [],
}: {
  role?: Role;
  // Vrai a la fois pour une vraie session partenaire/apporteur et pour un
  // interne en train de "voir comme" l'un des deux — controle ce qui est
  // masque dans la sidebar (role seul ne suffit pas : il reste "interne"
  // pendant la simulation, voir (app)/layout.tsx).
  isPartner?: boolean;
  isApporteur?: boolean;
  viewAsEmail?: string;
  partnerContacts?: { value: string; label: string }[];
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [viewAsPending, setViewAsPending] = useState(false);

  // Ferme le tiroir mobile à chaque navigation — sinon il reste ouvert
  // par-dessus la nouvelle page. Ajustement pendant le rendu plutôt qu'un
  // useEffect (pattern recommandé par React pour dériver un state depuis
  // une prop qui change).
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  // isPartner/isApporteur priment sur role tant qu'un interne "voit comme"
  // l'un des deux (role reste "interne" pendant la simulation, voir
  // (app)/layout.tsx).
  const effectiveRole: Role | undefined = isPartner
    ? "partenaire_location"
    : isApporteur
      ? "apporteur_affaire"
      : role;
  const groups = NAV_GROUPS.map((group) => ({
    ...group,
    links: group.links.filter((link) => !link.roles || (effectiveRole && link.roles.includes(effectiveRole))),
  })).filter((group) => group.links.length > 0);

  return (
    <>
      <button type="button" className="nav-mobile-toggle" onClick={() => setOpen(true)} aria-label="Ouvrir le menu">
        ☰
      </button>
      {open && (
        <div className="nav-backdrop-visible" onClick={() => setOpen(false)} aria-hidden="true" />
      )}
      <aside className={`flex flex-col nav-sidebar ${open ? "nav-sidebar-open" : ""}`}>
        <button type="button" className="nav-mobile-close" onClick={() => setOpen(false)} aria-label="Fermer le menu">
          ×
        </button>
        <div style={{ padding: "24px 20px" }}>
          <Link href="/" prefetch={false}>
            <Image src="/evecarplug-logo.svg" alt="EVE CAR PLUG" width={110} height={49} priority />
          </Link>
        </div>

        {role === "interne" && partnerContacts.length > 0 && (
          <div style={{ padding: "0 20px 16px" }}>
            <label htmlFor="viewAs" className="nav-section-label" style={{ display: "block", marginBottom: 6 }}>
              Voir comme partenaire
            </label>
            <select
              key={viewAsEmail ?? "none"}
              id="viewAs"
              name="viewAs"
              defaultValue={viewAsEmail ?? ""}
              disabled={viewAsPending}
              onChange={(e) => {
                const email = e.target.value;
                setViewAsPending(true);
                // Rechargement complet plutot qu'une navigation client : le
                // changement de persona doit se refleter partout (tableau de
                // bord, sidebar...), pas seulement sur la page courante — le
                // cache de routage cote client peut sinon garder une page
                // deja visitee affichee avec les anciennes donnees.
                const formData = new FormData();
                formData.set("viewAs", email);
                void setViewAsPartnerAction(formData).then(() => window.location.reload());
              }}
              className="input"
              style={{ minHeight: 34, fontSize: 13, width: "100%" }}
            >
              <option value="">— Vue interne —</option>
              {partnerContacts.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <nav className="flex flex-col" style={{ padding: "0 12px", flex: 1, gap: 20 }}>
          {groups.map((group) => (
            <div key={group.label ?? group.links[0].href} className="flex flex-col gap-1">
              {group.label && <span className="nav-section-label">{group.label}</span>}
              {group.links.map((link) => {
                const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
                return (
                  <div key={link.href}>
                    <Link
                      href={link.href}
                      prefetch={false}
                      className="nav-sidebar-link"
                      aria-current={isActive ? "page" : undefined}
                    >
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
    </>
  );
}
