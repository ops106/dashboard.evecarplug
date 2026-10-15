"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Chrome d'une modale glissant depuis la droite. Deux usages : piloté par la
// navigation (route interceptée, ex. /locations/[id] — fermer = router.back(),
// ce qui bascule Next.js sur le slot @modal/default.tsx et révèle la page en
// dessous) quand `onClose` n'est pas fourni, ou piloté par un state local
// (`onClose`) pour une fiche de lecture sans route dédiée (ex. détails d'une
// demande apportée, voir RequestDetailsButton).
export function SlideOver({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose?: () => void;
}) {
  const router = useRouter();

  function close() {
    if (onClose) onClose();
    else router.back();
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="slide-over-backdrop" onClick={close} aria-hidden="true" />
      <div className="slide-over-panel" role="dialog" aria-modal="true" aria-label={title}>
        <div className="slide-over-header">
          <span className="card-kicker">{title}</span>
          <button type="button" className="slide-over-close" onClick={close} aria-label="Fermer">
            ×
          </button>
        </div>
        <div className="slide-over-body">{children}</div>
      </div>
    </>
  );
}
