import Link from "next/link";
import { getAllLocations } from "@/lib/airtable/queries";
import { isCancelled, isNotYetInstalled } from "@/lib/airtable/mappers";
import { PendingRequestsTable } from "@/components/locations/PendingRequestsTable";
import { PartnerFilter } from "@/components/locations/PartnerFilter";

export default async function SuiviDemandesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; client?: string }>;
}) {
  const params = await searchParams;
  const showCancelled = params.tab === "annulees";

  const allLocations = await getAllLocations();
  const notInstalled = allLocations.filter(isNotYetInstalled);

  const clientOptions = Array.from(
    new Map(notInstalled.filter((l) => l.clientId).map((l) => [l.clientId as string, l.clientName])),
  )
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const filtered = params.client ? notInstalled.filter((l) => l.clientId === params.client) : notInstalled;
  const active = filtered.filter((l) => !isCancelled(l));
  const cancelled = filtered.filter(isCancelled);
  const displayed = showCancelled ? cancelled : active;

  const tabHref = (tab?: string) => {
    const qs = new URLSearchParams();
    if (params.client) qs.set("client", params.client);
    if (tab) qs.set("tab", tab);
    const query = qs.toString();
    return `/suivi-demandes${query ? `?${query}` : ""}`;
  };

  return (
    <div>
      <div className="mb-6">
        <h2 style={{ fontSize: 25 }}>Suivi des demandes</h2>
        <p className="mt-1 text-sm text-muted">Demandes pas encore installées, groupées par étape de vente.</p>
      </div>

      <PartnerFilter
        clients={clientOptions}
        value={params.client}
        resetHref={tabHref(showCancelled ? "annulees" : undefined)}
        extraParams={showCancelled ? { tab: "annulees" } : undefined}
      />

      <div className="tabs">
        <Link
          href={tabHref()}
          className={`tab ${!showCancelled ? "tab-active" : ""}`}
          aria-current={!showCancelled ? "page" : undefined}
        >
          Demandes en cours ({active.length})
        </Link>
        <Link
          href={tabHref("annulees")}
          className={`tab ${showCancelled ? "tab-active" : ""}`}
          aria-current={showCancelled ? "page" : undefined}
        >
          Demandes annulées ({cancelled.length})
        </Link>
      </div>

      <PendingRequestsTable locations={displayed} />
    </div>
  );
}
