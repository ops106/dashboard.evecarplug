import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getQuoteRequestById } from "@/lib/airtable/queries";
import { getSessionUser } from "@/lib/session";
import { getViewAsContext } from "@/lib/view-as";
import { QuoteDetailContent } from "@/components/locations/QuoteDetailContent";

export default async function QuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await getSessionUser();
  const { isInterne, isPartner, partnerId } = await getViewAsContext(session);
  if (!isInterne && !isPartner) redirect("/");

  const location = await getQuoteRequestById(id);
  if (!location) notFound();
  if (isPartner && location.clientId !== partnerId) notFound();

  return (
    <div className="space-y-6">
      <Link href="/facturation" className="text-sm text-muted hover:text-[var(--color-accent)]">
        ← Retour à la facturation
      </Link>
      <QuoteDetailContent location={location} canManage={isInterne && !isPartner} />
    </div>
  );
}
