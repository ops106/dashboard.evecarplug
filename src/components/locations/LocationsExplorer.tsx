"use client";

import { useMemo, useState } from "react";
import type { Location } from "@/lib/airtable/mappers";
import { isRelocationPending, isTerminationPending } from "@/lib/airtable/mappers";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { BoltIcon, MapPinIcon, StopOctagonIcon } from "@/components/ui/icons";
import { LocationsTable } from "@/components/locations/LocationsTable";

interface ClientOption {
  value: string;
  label: string;
}

// Filtrage 100% cote client (recherche + societe) : les locations actives
// sont deja toutes chargees par la page, donc pas besoin d'un aller-retour
// serveur a chaque frappe ou changement de societe — l'affichage reste
// instantane.
export function LocationsExplorer({
  locations,
  clientOptions,
  initialClient,
  isPartner,
}: {
  locations: Location[];
  clientOptions: ClientOption[];
  initialClient?: string;
  isPartner: boolean;
}) {
  const [q, setQ] = useState("");
  const [client, setClient] = useState(initialClient ?? "");

  const scoped = useMemo(
    () => (!isPartner && client ? locations.filter((l) => l.clientId === client) : locations),
    [locations, client, isPartner],
  );

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return scoped;
    return scoped.filter((l) =>
      [l.clientName, l.contact, l.siteName, l.chargerSerial, l.city]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [scoped, q]);

  const relocatingCount = scoped.filter(isRelocationPending).length;
  const terminatingCount = scoped.filter(isTerminationPending).length;

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
        <StatCard label="Bornes actives" value={scoped.length} icon={<BoltIcon />} />
        <StatCard label="Déménagements en cours" value={relocatingCount} icon={<MapPinIcon />} />
        <StatCard label="Résiliations en cours" value={terminatingCount} icon={<StopOctagonIcon />} />
      </div>

      <Card className="mb-6">
        <div className="flex flex-wrap items-end gap-3">
          <div className="field" style={{ minWidth: 240 }}>
            <label htmlFor="q">Recherche</label>
            <input
              id="q"
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Nom, société, site, n° borne…"
              className="input"
            />
          </div>
          {!isPartner && (
            <div className="field" style={{ minWidth: 200 }}>
              <label htmlFor="client">Société</label>
              <select
                id="client"
                value={client}
                onChange={(e) => setClient(e.target.value)}
                className="input"
              >
                <option value="">Toutes</option>
                {clientOptions.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          )}
          {(q || client) && (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setQ("");
                setClient("");
              }}
            >
              Réinitialiser
            </button>
          )}
        </div>
      </Card>

      <p className="mb-3 text-sm text-muted">
        {filtered.length} résultat{filtered.length > 1 ? "s" : ""}.
      </p>

      <LocationsTable locations={filtered} linkable={!isPartner} />
    </div>
  );
}
