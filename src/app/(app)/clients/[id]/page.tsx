import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getClientById, getLocationsByClientId } from "@/lib/airtable/queries";
import { getSessionUser } from "@/lib/session";
import { getViewAsContext } from "@/lib/view-as";
import { ClientDetailContent } from "@/components/clients/ClientDetailContent";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSessionUser();
  const { isInterne, isPartner, isFacturationEntreprise, partnerId } = await getViewAsContext(session);
  if (!isInterne && !isPartner && !isFacturationEntreprise) redirect("/");

  const { id } = await params;
  // Un partenaire ne peut consulter que sa propre fiche société (lien depuis
  // les tableaux "Travaux supplémentaires"/Facturation, pipeline distinct des
  // locations) — jamais celle d'un autre.
  if ((isPartner || isFacturationEntreprise) && id !== partnerId) notFound();

  const client = await getClientById(id);
  if (!client) notFound();

  const locations = await getLocationsByClientId(id);
  const activeLocations = locations.filter((l) => l.isActive);

  return (
    <div className="space-y-6">
      <Link
        href={isPartner || isFacturationEntreprise ? "/" : "/clients"}
        className="text-sm text-muted hover:text-[var(--color-accent)]"
      >
        {isPartner || isFacturationEntreprise ? "← Retour au tableau de bord" : "← Retour aux clients"}
      </Link>
      <ClientDetailContent client={client} activeLocations={activeLocations} />
    </div>
  );
}
