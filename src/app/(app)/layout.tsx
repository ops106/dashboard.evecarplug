import { Nav } from "@/components/layout/Nav";
import { NewRequestBubble } from "@/components/locations/NewRequestBubble";
import { getSessionUser } from "@/lib/session";
import { getPartnerEmbedHtml, getViewAsContacts } from "@/lib/airtable/queries";
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
  const { isInterne, isPartner, isApporteur, isFacturationEntreprise, partnerId, viewAsEmail } =
    await getViewAsContext(session);

  // Bulle "Transmettre une demande" : visible pour tous les personas
  // partenaires (location, apporteur, société contrat cadre), y compris
  // l'interne en mode "voir comme partenaire" — jamais sur la vue interne
  // non scopée (isInterne sans viewAsEmail, isPartner/isApporteur/
  // isFacturationEntreprise restent alors tous false, voir getViewAsContext).
  const isPartnerView = isPartner || isApporteur || isFacturationEntreprise;
  const viewAsContacts = isInterne ? await getViewAsContacts() : [];
  const embedHtml = isPartnerView && partnerId ? await getPartnerEmbedHtml(partnerId) : null;

  return (
    <div className="flex flex-1">
      <Nav
        role={session?.role}
        isPartner={isPartner}
        isApporteur={isApporteur}
        isFacturationEntreprise={isFacturationEntreprise}
        viewAsEmail={viewAsEmail}
        partnerContacts={viewAsContacts.map((c) => ({
          value: c.email,
          label: `${c.partnerName} — ${c.name} (${c.email})`,
        }))}
      />
      <main className="flex-1 px-6 py-8 app-main" style={{ overflowX: "auto" }}>
        <div className="mx-auto w-full max-w-7xl">{children}</div>
      </main>
      {isPartnerView && <NewRequestBubble embedHtml={embedHtml} />}
      {modal}
    </div>
  );
}
