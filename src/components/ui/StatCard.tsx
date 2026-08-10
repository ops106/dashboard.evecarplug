import { Card } from "./Card";

export function StatCard({
  label,
  value,
  sub,
  href,
}: {
  label: string;
  value: number | string;
  sub?: string;
  href?: string;
}) {
  const content = (
    <Card>
      <div className="card-kicker">{label}</div>
      <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: 40, lineHeight: 1.15, color: "var(--color-dark)" }} className="my-1">
        {value}
      </div>
      {sub && <div className="card-meta">{sub}</div>}
    </Card>
  );

  if (href) {
    return (
      <a href={href} className="block transition hover:opacity-80">
        {content}
      </a>
    );
  }

  return content;
}
