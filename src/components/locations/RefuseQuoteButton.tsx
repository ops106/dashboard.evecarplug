"use client";

import { useState } from "react";
import { closeDialogOnBackdropClick, useDialogAction } from "@/lib/useDialogAction";
import { refuseQuoteAction } from "@/lib/airtable/quote-actions";

export function RefuseQuoteButton({ locationId }: { locationId: string }) {
  const { dialogRef, pending, error, setError, open, close, run } = useDialogAction();
  const [reason, setReason] = useState("");
  const titleId = `refuse-quote-title-${locationId}`;

  function openDialog() {
    setReason("");
    open();
  }

  async function handleConfirm() {
    if (!reason.trim()) {
      setError("Renseignez une raison de refus.");
      return;
    }
    await run(() => refuseQuoteAction(locationId, reason));
  }

  return (
    <>
      <button type="button" className="btn btn-danger btn-sm" onClick={openDialog}>
        Refuser
      </button>
      <dialog ref={dialogRef} className="dialog" aria-labelledby={titleId} onClick={closeDialogOnBackdropClick}>
        <div className="dialog-body">
          <h3 id={titleId}>Refuser ce devis ?</h3>
          <p className="text-muted">Êtes-vous certain de vouloir refuser ce devis ?</p>
          <div className="field">
            <label htmlFor={`raison-refus-devis-${locationId}`}>Raison du refus</label>
            <textarea
              id={`raison-refus-devis-${locationId}`}
              className="input"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </div>
          {error && <p className="field-error">{error}</p>}
          <div className="dialog-footer">
            <button type="button" className="btn btn-ghost" onClick={close}>
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
