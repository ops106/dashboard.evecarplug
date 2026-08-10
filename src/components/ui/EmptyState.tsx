export function EmptyState({ message }: { message: string }) {
  return (
    <div
      className="p-10 text-center text-sm text-muted"
      style={{ border: "1.5px dashed var(--color-divider)", borderRadius: "var(--radius-card)" }}
    >
      {message}
    </div>
  );
}
