import { notFound, redirect } from "next/navigation";
import { getLocationById } from "@/lib/airtable/queries";
import { getSessionUser } from "@/lib/session";
import { getViewAsContext } from "@/lib/view-as";
import { PARTENAIRE_AUDIKA_RECORD_ID } from "@/lib/airtable/fields";
import { LocationDetailForm } from "@/components/locations/LocationDetailForm";
import { SlideOver } from "@/components/ui/SlideOver";

// Route interceptée : affichée en modale glissante lorsqu'on navigue vers
// /locations/[id] depuis une page sous (app) (clic sur un nom de client dans
// un tableau). Un accès direct par URL (partagé, rafraîchissement, lien de
// webhook) contourne l'interception et affiche la page complète normale
// (voir ../../locations/[id]/page.tsx).
export default async function LocationDetailModal({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await getSessionUser();
  const { isInterne, isPartner, partnerId } = await getViewAsContext(session);
  if (!isInterne && !isPartner) redirect("/locations");

  const location = await getLocationById(id);
  if (!location) notFound();
  if (isPartner && location.clientId !== partnerId) notFound();

  const canEdit = isInterne && !isPartner;
  const canEditEntity = isPartner && location.clientId === PARTENAIRE_AUDIKA_RECORD_ID;

  return (
    <SlideOver title="Fiche location">
      <LocationDetailForm location={location} canEdit={canEdit} canEditEntity={canEditEntity} />
    </SlideOver>
  );
}
