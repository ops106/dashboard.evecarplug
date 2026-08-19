import Link from "next/link";
import { getAllLocations, getPartnerLocationContactByEmail, getPartnerLocationContacts } from "@/lib/airtable/queries";
import {
  isCancelled,
  isInstallationInProgress,
  isNewRequest,
  isNotYetInstalled,
  isQualifying,
} from "@/lib/airtable/mappers";
import { PendingRequestsTable } from "@/components/locations/PendingRequestsTable";
import { PartnerFilter } from "@/components/locations/PartnerFilter";
import { ViewAsPartnerFilter } from "@/components/locations/ViewAsPartnerFilter";
import { StatCard } from "@/components/ui/StatCard";
import { ClockIcon, InboxIcon, StopOctagonIcon, WrenchIcon } from "@/components/ui/icons";
import { getSessionUser } from "@/lib/session";

export default async function SuiviDemandesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; client?: string; viewAs?: string }>;
}) {
  const params = await searchParams;
  const showCancelled = params.tab === "annulees";
  const session = await getSessionUser();
  const isInterne = session?.role === "interne";

  let isPartner = session?.role === "partenaire_location";
  let partnerId = session?.partnerId;
  let viewAsEmail: string | undefined;

  if (isInterne && params.viewAs) {
    const contact = await getPartnerLocationContactByEmail(params.viewAs);
    if (contact) {
      isPartner = true;
      partnerId = contact.partnerId;
      viewAsEmail = contact.email;
    }
  }

  const partnerContacts = isInterne ? await getPartnerLocationContacts() : [];

  const allLocations = await getAllLocations(isPartner ? { partnerId } : undefined);
  const notInstalled = allLocations.filter(isNotYetInstalled);

  const clientOptions = Array.from(
    new Map(notInstalled.filter((l) => l.clientId).map((l) => [l.clientId as string, l.clientName])),
  )
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const filtered =
    !isPartner && params.client ? notInstalled.filter((l) => l.clientId === params.client) : notInstalled;
  const active = filtered.filter((l) => !isCancelled(l));
  const cancelled = filtered.filter(isCancelled);
  const displayed = showCancelled ? cancelled : active;

  const newRequestsCount = filtered.filter(isNewRequest).length;
  const qualifyingCount = filtered.filter(isQualifying).length;
  const installationInProgressCount = filtered.filter(isInstallationInProgress).length;

  const tabHref = (tab?: string) => {
    const qs = new URLSearchParams();
    if (params.client) qs.set("client", params.client);
    if (viewAsEmail) qs.set("viewAs", viewAsEmail);
    if (tab) qs.set("tab", tab);
    const query = qs.toString();
    return `/suivi-demandes${query ? `?${query}` : ""}`;
  };

  // Le lien "Réinitialiser" du sélecteur "Voir comme partenaire" doit
  // justement retirer viewAs, contrairement à tabHref qui le préserve.
  const viewAsResetHref = (tab?: string) => {
    const qs = new URLSearchParams();
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

      {isInterne && (
        <ViewAsPartnerFilter
          contacts={partnerContacts.map((c) => ({
            value: c.email,
            label: `${c.partnerName} — ${c.name} (${c.email})`,
          }))}
          value={viewAsEmail}
          resetHref={viewAsResetHref(showCancelled ? "annulees" : undefined)}
          extraParams={showCancelled ? { tab: "annulees" } : undefined}
        />
      )}

      {!isPartner && (
        <PartnerFilter
          clients={clientOptions}
          value={params.client}
          resetHref={tabHref(showCancelled ? "annulees" : undefined)}
          extraParams={showCancelled ? { tab: "annulees" } : undefined}
        />
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard label="Nouvelles demandes" value={newRequestsCount} icon={<InboxIcon />} />
        <StatCard label="En cours de qualification" value={qualifyingCount} icon={<ClockIcon />} />
        <StatCard label="En cours d'installation" value={installationInProgressCount} icon={<WrenchIcon />} />
        <StatCard
          label="Demandes annulées"
          value={cancelled.length}
          href={tabHref("annulees")}
          icon={<StopOctagonIcon />}
        />
      </div>

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

      <PendingRequestsTable locations={displayed} linkable={!isPartner} />
    </div>
  );
}
