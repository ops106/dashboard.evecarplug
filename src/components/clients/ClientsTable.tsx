import Link from "next/link";
import type { Client } from "@/lib/airtable/mappers";
import { EmptyState } from "@/components/ui/EmptyState";

export function ClientsTable({
  clients,
  activeCounts,
}: {
  clients: Client[];
  activeCounts: Map<string, number>;
}) {
  if (clients.length === 0) {
    return <EmptyState message="Aucun client trouvé." />;
  }

  return (
    <div className="card overflow-x-auto p-0">
      <table className="table min-w-[560px]">
        <thead>
          <tr>
            <th>Client</th>
            <th>Type</th>
            <th>Email</th>
            <th>Locations actives</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr key={client.id}>
              <td className="font-medium">
                <Link href={`/clients/${client.id}`} className="text-inherit no-underline hover:underline">
                  {client.name}
                </Link>
              </td>
              <td>{client.type ?? "—"}</td>
              <td>{client.email ?? "—"}</td>
              <td>{activeCounts.get(client.id) ?? 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
