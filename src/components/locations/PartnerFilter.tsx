import Link from "next/link";

interface Option {
  value: string;
  label: string;
}

export function PartnerFilter({
  clients,
  value,
  resetHref,
  extraParams,
}: {
  clients: Option[];
  value?: string;
  resetHref: string;
  extraParams?: Record<string, string>;
}) {
  return (
    <form method="GET" className="mb-6 flex flex-wrap items-center gap-2 text-sm">
      {extraParams &&
        Object.entries(extraParams).map(([name, val]) => <input key={name} type="hidden" name={name} value={val} />)}
      <label htmlFor="client" className="text-muted">
        Société
      </label>
      <select
        id="client"
        name="client"
        defaultValue={value ?? ""}
        className="input"
        style={{ minHeight: 32, width: "auto", padding: "4px 8px", fontSize: 13 }}
      >
        <option value="">Toutes</option>
        {clients.map((c) => (
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
