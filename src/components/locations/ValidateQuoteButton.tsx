"use client";

import { closeDialogOnBackdropClick, useDialogAction } from "@/lib/useDialogAction";
import { validateQuoteAction } from "@/lib/airtable/quote-actions";

export function ValidateQuoteButton({ locationId }: { locationId: string }) {
  const { dialogRef, pending, error, open, close, run } = useDialogAction();
  const titleId = `validate-quote-title-${locationId}`;

  function handleConfirm() {
    return run(() => validateQuoteAction(locationId));
  }

  return (
    <>
      <button type="button" className="btn btn-secondary btn-sm" onClick={open}>
        Valider les travaux
      </button>
      <dialog ref={dialogRef} className="dialog" aria-labelledby={titleId} onClick={closeDialogOnBackdropClick}>
        <div className="dialog-body">
          <h3 id={titleId}>Valider ce devis ?</h3>
          <p className="text-muted">
            Le devis sera marqué comme validé et la demande sera également validée côté partenaire.
          </p>
          {error && <p className="field-error">{error}</p>}
          <div className="dialog-footer">
            <button type="button" className="btn btn-ghost" onClick={close}>
              Annuler
            </button>
            <button type="button" className="btn btn-primary" disabled={pending} onClick={handleConfirm}>
              {pending ? "Envoi..." : "Valider les travaux"}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
