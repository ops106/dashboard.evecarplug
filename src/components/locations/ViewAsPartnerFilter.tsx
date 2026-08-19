import Link from "next/link";

interface Option {
  value: string;
  label: string;
}

// Reserve a la persona "Interne" : simule la vue d'un contact "Partenaire
// location" (memes tableaux, meme scope) sans se connecter a sa place —
// voir la resolution de ?viewAs=email dans chaque page.
export function ViewAsPartnerFilter({
  contacts,
  value,
  resetHref,
  extraParams,
}: {
  contacts: Option[];
  value?: string;
  resetHref: string;
  extraParams?: Record<string, string>;
}) {
  if (contacts.length === 0) return null;

  return (
    <form method="GET" className="card mb-6 inline-flex flex-wrap items-center gap-2 p-3 text-sm">
      {extraParams &&
        Object.entries(extraParams).map(([name, val]) => <input key={name} type="hidden" name={name} value={val} />)}
      <label htmlFor="viewAs" className="text-muted">
        Voir comme partenaire
      </label>
      <select
        id="viewAs"
        name="viewAs"
        defaultValue={value ?? ""}
        className="input"
        style={{ minHeight: 32, width: "auto", padding: "4px 8px", fontSize: 13 }}
      >
        <option value="">— Vue interne —</option>
        {contacts.map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
      </select>
      <button type="submit" className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 13 }}>
        Filtrer
      </button>
      {value && (
        <Link href={resetHref} className="text-muted hover:text-[var(--color-accent)]">
          Réinitialiser
        </Link>
      )}
    </form>
  );
}
