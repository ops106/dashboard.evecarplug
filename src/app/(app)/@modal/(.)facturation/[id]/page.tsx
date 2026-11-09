import { notFound, redirect } from "next/navigation";
import { getQuoteRequestById } from "@/lib/airtable/queries";
import { getSessionUser } from "@/lib/session";
import { getViewAsContext } from "@/lib/view-as";
import { isWithinPartnerScope } from "@/lib/airtable/partner-scope";
import { QuoteDetailContent } from "@/components/locations/QuoteDetailContent";
import { SlideOver } from "@/components/ui/SlideOver";

// Route interceptée : affichée en modale glissante lorsqu'on navigue vers
// /facturation/[id] depuis une page sous (app) (clic sur un contact dans les
// tableaux Travaux supplémentaires / Facturation). Un accès direct par URL
// contourne l'interception et affiche la page complète normale (voir
// ../../facturation/[id]/page.tsx).
export default async function QuoteDetailModal({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await getSessionUser();
  const { isInterne, isPartner, isFacturationEntreprise, partnerId } = await getViewAsContext(session);
  if (!isInterne && !isPartner && !isFacturationEntreprise) redirect("/");

  const location = await getQuoteRequestById(id);
  if (!location) notFound();
  if ((isPartner || isFacturationEntreprise) && !isWithinPartnerScope(location.clientId, partnerId)) notFound();

  return (
    <SlideOver title="Fiche demande">
      <QuoteDetailContent location={location} canManage={isInterne && !isPartner && !isFacturationEntreprise} />
    </SlideOver>
  );
}
