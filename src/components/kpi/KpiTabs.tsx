"use client";

import { useState } from "react";

type Tab = "usage" | "opportunities";

// Meme pattern que DashboardActionTabs : les deux sections sont deja
// entierement calculees cote serveur (props), le switch d'onglet est donc
// instantane, sans aller-retour reseau.
export function KpiTabs({ usage, opportunities }: { usage: React.ReactNode; opportunities: React.ReactNode }) {
  const [tab, setTab] = useState<Tab>("usage");

  return (
    <div>
      <div className="tabs">
        <button
          type="button"
          className={`tab ${tab === "usage" ? "tab-active" : ""}`}
          onClick={() => setTab("usage")}
        >
          Utilisation
        </button>
        <button
          type="button"
          className={`tab ${tab === "opportunities" ? "tab-active" : ""}`}
          onClick={() => setTab("opportunities")}
        >
          Opportunités
        </button>
      </div>

      {tab === "usage" && usage}
      {tab === "opportunities" && opportunities}
    </div>
  );
}
