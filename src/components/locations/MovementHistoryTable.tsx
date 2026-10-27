import type { MovementLogRecord } from "@/lib/airtable/queries";
import { formatDateTime } from "@/lib/format";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { ExportXlsButton } from "@/components/ui/ExportXlsButton";
import { toExportDate } from "@/lib/export-xlsx";

function toExportRows(entries: MovementLogRecord[]) {
  return entries.map((e) => ({
    Date: toExportDate(e.date),
    Type: e.type ?? "—",
    Société: e.clientName,
    Client: e.contact || "—",
    "Évolution du statut": `${e.oldStatus || "—"} → ${e.newStatus || "—"}`,
    Détail: e.detail || "—",
    "Effectué par": e.actor,
  }));
}

export function MovementHistoryTable({ entries }: { entries: MovementLogRecord[] }) {
  if (entries.length === 0) {
    return <EmptyState message="Aucun mouvement locatif abouti pour l'instant." />;
  }

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <ExportXlsButton rows={toExportRows(entries)} filename="historique-mouvements.xlsx" />
      </div>
      <div className="card overflow-x-auto p-0">
        <table className="table min-w-[860px]">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Société</th>
              <th>Client</th>
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
                <td>{entry.contact || "—"}</td>
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
    </div>
  );
}
