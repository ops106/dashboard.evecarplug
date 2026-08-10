import { getAllClients, getAllLocations } from "@/lib/airtable/queries";
import { ClientsTable } from "@/components/clients/ClientsTable";

export default async function ClientsPage() {
  const [clients, locations] = await Promise.all([getAllClients(), getAllLocations()]);

  const activeCounts = new Map<string, number>();
  for (const location of locations) {
    if (!location.isActive || !location.clientId) continue;
    activeCounts.set(location.clientId, (activeCounts.get(location.clientId) ?? 0) + 1);
  }

  return (
    <div>
      <div className="mb-6">
        <h2 style={{ fontSize: 25 }}>Clients</h2>
        <p className="mt-1 text-sm text-muted">{clients.length} clients partenaires.</p>
      </div>
      <ClientsTable clients={clients} activeCounts={activeCounts} />
    </div>
  );
}
