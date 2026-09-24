"use client";

import { useState } from "react";
import type { Location } from "@/lib/airtable/mappers";
import { isRelocationPending, isTerminationPending } from "@/lib/airtable/mappers";
import { RelocationStatusTable } from "@/components/locations/RelocationStatusTable";
import { TerminationStatusTable } from "@/components/locations/TerminationStatusTable";

export function MovementsStatusTabs({
  relocations,
  terminations,
}: {
  relocations: Location[];
  terminations: Location[];
}) {
  const [tab, setTab] = useState<"demenagement" | "resiliation">("demenagement");

  // Le badge de l'onglet compte ce qui est encore à traiter — pas les
  // statuts terminaux (Terminé/Refusé, Résilié/Refusé) déjà affichés dans la
  // liste à titre d'historique.
  const relocationPendingCount = relocations.filter(isRelocationPending).length;
  const terminationPendingCount = terminations.filter(isTerminationPending).length;

  return (
    <div>
      <div className="tabs">
        <button
          type="button"
          className={`tab ${tab === "demenagement" ? "tab-active" : ""}`}
          onClick={() => setTab("demenagement")}
        >
          Changements d&apos;adresse
          <span className="tag tag-accent" style={{ marginLeft: 8 }}>
            {relocationPendingCount}
          </span>
        </button>
        <button
          type="button"
          className={`tab ${tab === "resiliation" ? "tab-active" : ""}`}
          onClick={() => setTab("resiliation")}
        >
          Arrêts de location
          <span className="tag tag-accent" style={{ marginLeft: 8 }}>
            {terminationPendingCount}
          </span>
        </button>
      </div>
      {tab === "demenagement" ? (
        <RelocationStatusTable locations={relocations} />
      ) : (
        <TerminationStatusTable locations={terminations} />
      )}
    </div>
  );
}
