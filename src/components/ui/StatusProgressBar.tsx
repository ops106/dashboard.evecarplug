// Barre de progression compacte pour une ligne de tableau : proportion
// remplie = position du statut courant dans le pipeline (`order`). Le statut
// "Refusé" n'appartient pas au pipeline linéaire — barre pleine en rouge
// plutôt qu'une position arbitraire.
export function StatusProgressBar({
  order,
  refusedStatus,
  status,
}: {
  order: readonly string[];
  refusedStatus: string;
  status?: string;
}) {
  const isRefused = status === refusedStatus;
  const stepIndex = status ? order.indexOf(status) : -1;
  const ratio = isRefused ? 1 : stepIndex >= 0 ? (stepIndex + 1) / order.length : 0;

  return (
    <div className="progress-bar" title={status || "Sans statut"}>
      <div
        className={`progress-bar-fill${isRefused ? " progress-bar-fill-danger" : ""}`}
        style={{ width: `${Math.round(ratio * 100)}%` }}
      />
    </div>
  );
}
