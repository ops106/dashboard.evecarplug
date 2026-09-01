import { Nav } from "@/components/layout/Nav";
import { getSessionUser } from "@/lib/session";

// Donnees live depuis Airtable, derriere l'auth par email : pas de
// generation statique au build, tout est rendu a la demande.
export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionUser();

  return (
    <div className="flex flex-1">
      <Nav role={session?.role} />
      <main className="flex-1 px-6 py-8 app-main" style={{ overflowX: "auto" }}>
        <div className="mx-auto w-full max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
