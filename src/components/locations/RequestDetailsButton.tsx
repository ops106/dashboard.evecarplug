"use client";

import { useState } from "react";
import type { Location } from "@/lib/airtable/mappers";
import { formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/ui/Badge";
import { SlideOver } from "@/components/ui/SlideOver";
import { Card } from "@/components/ui/Card";

function Field({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-0.5 text-sm">{value ?? "—"}</dd>
    </div>
  );
}

// Fiche de lecture rapide pour l'apporteur d'affaires (et l'interne qui
// consulte les demandes apportées par un apporteur donné) : ces demandes
// vivent hors du pipeline Location (voir getReferredLocations), donc
// /locations/[id] ne leur correspond pas (getLocationById y renvoie null
// faute du bon Pipeline) — une modale glissante en lecture suffit, pas
// besoin du gros formulaire d'édition réservé à l'interne. Pas de route
// dédiée ici (contrairement à /locations/[id]) : state local plutôt que
// navigation, voir le prop `onClose` de SlideOver.
export function RequestDetailsButton({ location }: { location: Location }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="bg-transparent border-0 p-0 m-0 cursor-pointer font-inherit text-left underline decoration-dotted decoration-1 underline-offset-2 hover:decoration-solid"
        style={{ color: "var(--color-accent)" }}
        onClick={() => setOpen(true)}
      >
        {location.contact || "—"}
      </button>
      {open && (
        <SlideOver title="Détails de la demande" onClose={() => setOpen(false)}>
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="m-0">{location.contact || location.clientName}</h3>
              <StatusBadge value={location.stage} />
            </div>

            <Card>
              <h4 className="mb-4">Société & contact</h4>
              <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="Société" value={location.clientName} />
                <Field label="Date de la demande" value={formatDate(location.requestDate)} />
                <Field label="Email" value={location.email} />
                <Field label="Téléphone" value={location.phone} />
                <Field label="Adresse" value={location.fullAddress || location.address} />
                <Field label="Ville" value={location.city} />
              </dl>
            </Card>

            <Card>
              <h4 className="mb-4">Équipement</h4>
              <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="Type de client" value={location.clientType} />
                <Field label="Nombre de bornes" value={location.chargerCount} />
                <Field label="Type de courant" value={location.currentType} />
                <Field label="Puissance de borne" value={location.power ? `${location.power} kW` : undefined} />
              </dl>
            </Card>

            {(location.commercial || location.vehicle) && (
              <Card>
                <h4 className="mb-4">Suivi commercial</h4>
                <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Field label="Commercial" value={location.commercial} />
                  <Field label="Email du commercial" value={location.salesRepEmail} />
                  <Field label="Site" value={location.siteName} />
                  <Field label="Véhicule" value={location.vehicle} />
                </dl>
              </Card>
            )}
          </div>
        </SlideOver>
      )}
    </>
  );
}
