import { Nav } from "@/components/layout/Nav";

// Donnees live depuis Airtable, derriere l'auth par mot de passe : pas de
// generation statique au build, tout est rendu a la demande.
export const dynamic = "force-dynamic";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">{children}</main>
    </>
  );
}
