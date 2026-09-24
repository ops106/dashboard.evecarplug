import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getLocationById } from "@/lib/airtable/queries";
import { getSessionUser } from "@/lib/session";
import { getViewAsContext } from "@/lib/view-as";
import { PARTENAIRE_AUDIKA_RECORD_ID } from "@/lib/airtable/fields";
import { LocationDetailForm } from "@/components/locations/LocationDetailForm";

export default async function LocationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Un partenaire peut consulter (lecture seule) la fiche d'une de ses
  // propres locations, jamais celle d'un autre — voir la verification
  // location.clientId === partnerId ci-dessous.
  const session = await getSessionUser();
  const { isInterne, isPartner, partnerId } = await getViewAsContext(session);
  if (!isInterne && !isPartner) redirect("/locations");

  const location = await getLocationById(id);
  if (!location) notFound();
  if (isPartner && location.clientId !== partnerId) notFound();

  const canEdit = isInterne && !isPartner;
  const canEditEntity = isPartner && location.clientId === PARTENAIRE_AUDIKA_RECORD_ID;

  return (
    <div className="space-y-6">
      <Link href="/locations" className="text-sm text-muted hover:text-[var(--color-accent)]">
        ← Retour aux locations
      </Link>
      <LocationDetailForm location={location} canEdit={canEdit} canEditEntity={canEditEntity} />
    </div>
  );
}
