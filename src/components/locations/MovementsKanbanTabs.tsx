"use client";

import { useState } from "react";
import type { Location } from "@/lib/airtable/mappers";
import { isRelocationPending, isTerminationPending } from "@/lib/airtable/mappers";
import { RelocationKanban } from "@/components/locations/RelocationKanban";
import { TerminationKanban } from "@/components/locations/TerminationKanban";

export function MovementsKanbanTabs({
  relocations,
  terminations,
}: {
  relocations: Location[];
  terminations: Location[];
}) {
  const [tab, setTab] = useState<"demenagement" | "resiliation">("demenagement");

  // Le badge de l'onglet compte ce qui est encore à traiter — pas les
  // statuts terminaux (Terminé/Refusé, Résilié/Refusé) déjà affichés dans le
  // kanban à titre d'historique.
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
        <RelocationKanban locations={relocations} />
      ) : (
        <TerminationKanban locations={terminations} />
      )}
    </div>
  );
}
