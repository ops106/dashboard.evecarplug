"use client";

import { useState } from "react";
import type { Location } from "@/lib/airtable/mappers";
import { RelocationRequestsTable } from "@/components/locations/RelocationRequestsTable";
import { TerminationRequestsTable } from "@/components/locations/TerminationRequestsTable";
import { ExternalValidationTable } from "@/components/locations/ExternalValidationTable";
import { QuoteValidationTable } from "@/components/locations/QuoteValidationTable";

type Tab = "relocations" | "terminations" | "validations" | "quotes";

export function DashboardActionTabs({
  relocations,
  terminations,
  externalValidation,
  entitiesByClient,
  quoteValidation,
}: {
  relocations: Location[];
  terminations: Location[];
  externalValidation: Location[];
  entitiesByClient: Record<string, string[]>;
  quoteValidation: Location[];
}) {
  // Classes du plus urgent (le plus de choses a traiter) au moins urgent —
  // recalcule a chaque rendu plutot que memorise, pour rester a jour si les
  // compteurs changent (ex. apres une action) sans reordonner sous les yeux
  // de l'utilisateur au milieu d'un clic.
  const items: { id: Tab; label: string; count: number }[] = [
    { id: "relocations", label: "Changements d'adresse", count: relocations.length },
    { id: "terminations", label: "Arrêts de location", count: terminations.length },
    { id: "validations", label: "Validations", count: externalValidation.length },
    { id: "quotes", label: "Travaux supplémentaires", count: quoteValidation.length },
  ];
  const tabs = [...items].sort((a, b) => b.count - a.count);

  const [tab, setTab] = useState<Tab>(tabs[0].id);

  return (
    <div>
      <div className="tabs">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`tab ${tab === t.id ? "tab-active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
            <span className="tag tag-accent" style={{ marginLeft: 8 }}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {tab === "relocations" && <RelocationRequestsTable locations={relocations} />}
      {tab === "terminations" && <TerminationRequestsTable locations={terminations} />}
      {tab === "validations" && (
        <ExternalValidationTable locations={externalValidation} entitiesByClient={entitiesByClient} />
      )}
      {tab === "quotes" && <QuoteValidationTable locations={quoteValidation} />}
    </div>
  );
}
