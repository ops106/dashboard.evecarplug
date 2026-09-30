export function OpenOpportunitiesTable({
  title,
  sub,
  labelHeader,
  rows,
}: {
  title: string;
  sub?: string;
  labelHeader: string;
  rows: { label: string; last2Weeks: number; last2Months: number }[];
}) {
  return (
    <div>
      <h4 className="mb-1">{title}</h4>
      {sub && <p className="mb-3 text-sm text-muted">{sub}</p>}
      <div className="card overflow-x-auto p-0">
        <table className="table min-w-[500px]">
          <thead>
            <tr>
              <th>{labelHeader}</th>
              <th style={{ textAlign: "right" }}>2 dernières semaines</th>
              <th style={{ textAlign: "right" }}>2 derniers mois</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-muted">
                  Aucune opportunité ouverte.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.label}>
                  <td className="font-medium">{r.label}</td>
                  <td style={{ textAlign: "right" }}>{r.last2Weeks}</td>
                  <td style={{ textAlign: "right" }}>{r.last2Months}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
