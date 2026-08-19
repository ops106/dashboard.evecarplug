import Link from "next/link";
import { Card } from "@/components/ui/Card";

interface Option {
  value: string;
  label: string;
}

export function LocationFilters({
  clients,
  cities,
  currentTypes,
  values,
  showClientFilter = true,
  partnerContacts,
}: {
  clients: Option[];
  cities: string[];
  currentTypes: string[];
  values: {
    client?: string;
    ville?: string;
    courant?: string;
    q?: string;
    all?: string;
    viewAs?: string;
  };
  showClientFilter?: boolean;
  // Réservé à la persona "Interne" : "voir comme" un partenaire location.
  // Dans le même formulaire que les autres filtres pour ne rien perdre à
  // la soumission (soumettre un formulaire GET remplace toute la query).
  partnerContacts?: Option[];
}) {
  return (
    <Card className="mb-6">
      <form method="GET" className="flex flex-wrap items-end gap-3">
        {partnerContacts && partnerContacts.length > 0 && (
          <div className="field">
            <label htmlFor="viewAs">Voir comme partenaire</label>
            <select id="viewAs" name="viewAs" defaultValue={values.viewAs ?? ""} className="input">
              <option value="">— Vue interne —</option>
              {partnerContacts.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {showClientFilter && (
          <div className="field">
            <label htmlFor="client">Client</label>
            <select id="client" name="client" defaultValue={values.client ?? ""} className="input">
              <option value="">Tous</option>
              {clients.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="field">
          <label htmlFor="ville">Ville</label>
          <select id="ville" name="ville" defaultValue={values.ville ?? ""} className="input">
            <option value="">Toutes</option>
            {cities.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="courant">Type de courant</label>
          <select id="courant" name="courant" defaultValue={values.courant ?? ""} className="input">
            <option value="">Tous</option>
            {currentTypes.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="q">Recherche</label>
          <input
            id="q"
            name="q"
            type="text"
            defaultValue={values.q ?? ""}
            placeholder="Client, site, n° borne…"
            className="input"
          />
        </div>

        <label className="flex items-center gap-2 pb-2 text-sm">
          <input
            type="checkbox"
            name="all"
            value="1"
            defaultChecked={values.all === "1"}
            style={{ accentColor: "var(--color-accent)" }}
          />
          Afficher toutes les demandes
        </label>

        <button type="submit" className="btn btn-primary">
          Filtrer
        </button>
        <Link href="/locations" className="btn btn-ghost">
          Réinitialiser
        </Link>
      </form>
    </Card>
  );
}
