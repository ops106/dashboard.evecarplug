import { Nav } from "@/components/layout/Nav";
import { getSessionUser } from "@/lib/session";
import { getViewAsContacts } from "@/lib/airtable/queries";
import { getViewAsContext } from "@/lib/view-as";

// Donnees live depuis Airtable, derriere l'auth par email : pas de
// generation statique au build, tout est rendu a la demande.
export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  const session = await getSessionUser();
  const { isInterne, isPartner, isApporteur, viewAsEmail } = await getViewAsContext(session);

  const viewAsContacts = isInterne ? await getViewAsContacts() : [];

  return (
    <div className="flex flex-1">
      <Nav
        role={session?.role}
        isPartner={isPartner}
        isApporteur={isApporteur}
        viewAsEmail={viewAsEmail}
        partnerContacts={viewAsContacts.map((c) => ({
          value: c.email,
          label: `${c.partnerName} — ${c.name} (${c.email})`,
        }))}
      />
      <main className="flex-1 px-6 py-8 app-main" style={{ overflowX: "auto" }}>
        <div className="mx-auto w-full max-w-7xl">{children}</div>
      </main>
      {modal}
    </div>
  );
}
