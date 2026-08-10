"use client";

import { useRef, useState } from "react";
import { refuseExternalRequestAction } from "@/lib/airtable/external-validation-actions";

export function RefuseExternalRequestButton({ locationId }: { locationId: string }) {
  const confirmRef = useRef<HTMLDialogElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const titleId = `refuse-external-title-${locationId}`;

  function openConfirm() {
    setError(null);
    confirmRef.current?.showModal();
  }

  async function handleConfirm() {
    setPending(true);
    setError(null);
    try {
      await refuseExternalRequestAction(locationId);
      confirmRef.current?.close();
    } catch {
      setError("Une erreur est survenue, réessayez.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <button type="button" className="btn btn-ghost" style={{ padding: "6px 14px" }} onClick={openConfirm}>
        Refuser
      </button>
      <dialog
        ref={confirmRef}
        className="dialog"
        aria-labelledby={titleId}
        onClick={(e) => {
          if (e.target === e.currentTarget) e.currentTarget.close();
        }}
      >
        <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          <h3 id={titleId}>Refuser cette demande ?</h3>
          <p className="text-muted">Êtes-vous certain de vouloir refuser cette demande ?</p>
          {error && <p style={{ color: "var(--color-danger)", fontSize: 13 }}>{error}</p>}
          <div className="flex gap-2" style={{ justifyContent: "flex-end" }}>
            <button type="button" className="btn btn-ghost" onClick={() => confirmRef.current?.close()}>
              Annuler
            </button>
            <button type="button" className="btn btn-danger-solid" disabled={pending} onClick={handleConfirm}>
              {pending ? "Envoi..." : "Refuser"}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
