import { cookies } from "next/headers";
import { Nav } from "@/components/layout/Nav";
import { getSessionUser } from "@/lib/session";
import { getPartnerLocationContacts } from "@/lib/airtable/queries";
import { VIEW_AS_COOKIE_NAME } from "@/lib/view-as";

// Donnees live depuis Airtable, derriere l'auth par email : pas de
// generation statique au build, tout est rendu a la demande.
export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionUser();
  const isInterne = session?.role === "interne";

  const [partnerContacts, cookieStore] = await Promise.all([
    isInterne ? getPartnerLocationContacts() : Promise.resolve([]),
    cookies(),
  ]);
  const viewAsEmail = cookieStore.get(VIEW_AS_COOKIE_NAME)?.value;

  return (
    <div className="flex flex-1">
      <Nav
        role={session?.role}
        viewAsEmail={viewAsEmail}
        partnerContacts={partnerContacts.map((c) => ({
          value: c.email,
          label: `${c.partnerName} — ${c.name} (${c.email})`,
        }))}
      />
      <main className="flex-1 px-6 py-8 app-main" style={{ overflowX: "auto" }}>
        <div className="mx-auto w-full max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
