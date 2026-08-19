import { redirect } from "next/navigation";
import { getAllClients, getAllLocations } from "@/lib/airtable/queries";
import { getSessionUser } from "@/lib/session";
import { ClientsTable } from "@/components/clients/ClientsTable";

// Liste toutes les sociétés partenaires — jamais accessible à une session
// "Partenaire location", qui n'a rien à voir des autres sociétés.
export default async function ClientsPage() {
  const session = await getSessionUser();
  if (session?.role !== "interne") redirect("/");

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
