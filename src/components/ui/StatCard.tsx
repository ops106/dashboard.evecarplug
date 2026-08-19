import { Card } from "./Card";

export function StatCard({
  label,
  value,
  sub,
  href,
  icon,
}: {
  label: string;
  value: number | string;
  sub?: string;
  href?: string;
  icon?: React.ReactNode;
}) {
  const content = (
    <Card>
      <div className="flex items-center gap-2.5">
        {icon && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 32,
              height: 32,
              borderRadius: 10,
              background: "var(--color-accent-light)",
              color: "var(--color-accent)",
              flexShrink: 0,
            }}
          >
            {icon}
          </div>
        )}
        <div className="card-kicker">{label}</div>
      </div>
      <div
        style={{
          fontFamily: "var(--font-heading)",
          fontWeight: 900,
          fontSize: 40,
          lineHeight: 1.15,
          color: "var(--color-dark)",
        }}
        className="my-1"
      >
        {value}
      </div>
      {sub && <div className="card-meta">{sub}</div>}
    </Card>
  );

  if (href) {
    return (
      <a href={href} className="stat-card-link">
        {content}
      </a>
    );
  }

  return content;
}
