import { Card } from "@/components/ui/Card";

export function StatusCountTable({
  title,
  sub,
  rows,
  labelHeader = "Statut",
}: {
  title: string;
  sub?: string;
  rows: { label: string; count: number }[];
  labelHeader?: string;
}) {
  const total = rows.reduce((sum, r) => sum + r.count, 0);

  return (
    <Card className="p-0 overflow-hidden">
      <div style={{ padding: "16px 20px 8px" }}>
        <h4>{title}</h4>
        {sub && <p className="mt-1 text-sm text-muted">{sub}</p>}
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>{labelHeader}</th>
            <th style={{ textAlign: "right" }}>Nombre</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label}>
              <td>{r.label}</td>
              <td style={{ textAlign: "right", fontWeight: 700 }}>{r.count}</td>
            </tr>
          ))}
          <tr className="status-group-row">
            <td>Total</td>
            <td style={{ textAlign: "right" }}>{total}</td>
          </tr>
        </tbody>
      </table>
    </Card>
  );
}
