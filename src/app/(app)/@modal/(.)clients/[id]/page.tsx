import { notFound, redirect } from "next/navigation";
import { getClientById, getLocationsByClientId } from "@/lib/airtable/queries";
import { getSessionUser } from "@/lib/session";
import { getViewAsContext } from "@/lib/view-as";
import { ClientDetailContent } from "@/components/clients/ClientDetailContent";
import { SlideOver } from "@/components/ui/SlideOver";

// Route interceptée : affichée en modale glissante lorsqu'on navigue vers
// /clients/[id] depuis une page sous (app) (clic sur un nom de client dans
// un tableau Facturation/Travaux supplémentaires). Un accès direct par URL
// contourne l'interception et affiche la page complète normale (voir
// ../../clients/[id]/page.tsx).
export default async function ClientDetailModal({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await getSessionUser();
  const { isInterne, isPartner, partnerId } = await getViewAsContext(session);
  if (!isInterne && !isPartner) redirect("/");
  if (isPartner && id !== partnerId) notFound();

  const client = await getClientById(id);
  if (!client) notFound();

  const locations = await getLocationsByClientId(id);
  const activeLocations = locations.filter((l) => l.isActive);

  return (
    <SlideOver title="Fiche société">
      <ClientDetailContent client={client} activeLocations={activeLocations} />
    </SlideOver>
  );
}
