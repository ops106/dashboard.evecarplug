type Tone = "success" | "warning" | "danger" | "neutral" | "accent";

const TONE_CLASSES: Record<Tone, string> = {
  success: "tag-success",
  warning: "tag-warning",
  danger: "tag-danger",
  neutral: "tag-neutral",
  accent: "tag-accent",
};

export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: Tone }) {
  return <span className={`tag ${TONE_CLASSES[tone]}`}>{children}</span>;
}

const DANGER_VALUES = ["Lost", "Cancelled", "Refusée", "Refusé", "09. Projet annulé"];
const WARNING_VALUES = ["En attente", "Nouvelle demande", "Late", "À valider", "A valider"];
const SUCCESS_VALUES = [
  "Won",
  "Closed",
  "Validée",
  "Validé",
  "Acceptée",
  "Réalisé",
  "Résilié",
  "Terminée",
  "Terminé",
  "08. Installation terminée",
];

function toneForValue(value?: string): Tone {
  if (!value) return "neutral";
  if (DANGER_VALUES.includes(value)) return "danger";
  if (WARNING_VALUES.includes(value)) return "warning";
  if (SUCCESS_VALUES.includes(value)) return "success";
  return "accent";
}

export function StatusBadge({ value }: { value?: string }) {
  return <Badge tone={toneForValue(value)}>{value ?? "—"}</Badge>;
}
