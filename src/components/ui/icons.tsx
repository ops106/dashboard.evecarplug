// Icônes inline (pas de dépendance externe) : traits fins, cohérents avec le
// reste du design system, dimensionnées via currentColor pour hériter la
// couleur du contexte (voir StatCard).
function IconBase({ children }: { children: React.ReactNode }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function BoltIcon() {
  return (
    <IconBase>
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
    </IconBase>
  );
}

export function MapPinIcon() {
  return (
    <IconBase>
      <path d="M12 21s7-7.58 7-12a7 7 0 1 0-14 0c0 4.42 7 12 7 12Z" />
      <circle cx="12" cy="9" r="2.4" />
    </IconBase>
  );
}

export function StopOctagonIcon() {
  return (
    <IconBase>
      <path d="M8.5 3h7L21 8.5v7L15.5 21h-7L3 15.5v-7L8.5 3Z" />
      <path d="M9.5 9.5 14.5 14.5M14.5 9.5 9.5 14.5" />
    </IconBase>
  );
}

export function CheckBadgeIcon() {
  return (
    <IconBase>
      <path d="M12 2.5 14.5 5l3.4-.3.8 3.4 3 1.8-1.5 3.1 1.5 3.1-3 1.8-.8 3.4-3.4-.3L12 21.5 9.5 19l-3.4.3-.8-3.4-3-1.8L3.8 11 2.3 7.9l3-1.8.8-3.4L9.5 5 12 2.5Z" />
      <path d="M8.5 12.5 11 15l4.5-5.5" />
    </IconBase>
  );
}

export function InboxIcon() {
  return (
    <IconBase>
      <path d="M4 12h4l2 3h4l2-3h4" />
      <path d="M4 12 5.5 5A2 2 0 0 1 7.44 3.5h9.12A2 2 0 0 1 18.5 5L20 12" />
      <path d="M4 12v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6" />
    </IconBase>
  );
}

export function ClockIcon() {
  return (
    <IconBase>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </IconBase>
  );
}

export function EyeIcon() {
  return (
    <IconBase>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </IconBase>
  );
}

export function WrenchIcon() {
  return (
    <IconBase>
      <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2-2 2.5-2.5Z" />
    </IconBase>
  );
}
