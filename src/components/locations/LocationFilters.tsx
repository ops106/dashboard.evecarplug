import Link from "next/link";
import { Card } from "@/components/ui/Card";

export function LocationFilters({ values }: { values: { q?: string } }) {
  return (
    <Card className="mb-6">
      <form method="GET" className="flex flex-wrap items-end gap-3">
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

        <button type="submit" className="btn btn-primary">
          Filtrer
        </button>
        {values.q && (
          <Link href="/locations" className="btn btn-ghost">
            Réinitialiser
          </Link>
        )}
      </form>
    </Card>
  );
}
