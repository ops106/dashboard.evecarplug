import type { MovementLogRecord } from "@/lib/airtable/queries";
import { formatDateTime } from "@/lib/format";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";

export function MovementHistoryTable({ entries }: { entries: MovementLogRecord[] }) {
  if (entries.length === 0) {
    return <EmptyState message="Aucun mouvement locatif abouti pour l'instant." />;
  }

  return (
    <div className="card overflow-x-auto p-0">
      <table className="table min-w-[860px]">
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Société</th>
            <th>Évolution du statut</th>
            <th>Détail</th>
            <th>Effectué par</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id}>
              <td className="whitespace-nowrap">{formatDateTime(entry.date)}</td>
              <td>
                <Badge tone={entry.type === "Résiliation" ? "danger" : "accent"}>{entry.type ?? "—"}</Badge>
              </td>
              <td className="font-medium">{entry.clientName}</td>
              <td>
                {entry.oldStatus || "—"} → {entry.newStatus || "—"}
              </td>
              <td>{entry.detail || "—"}</td>
              <td>{entry.actor}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
