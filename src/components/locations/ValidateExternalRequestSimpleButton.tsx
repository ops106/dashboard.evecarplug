"use client";

import { closeDialogOnBackdropClick, useDialogAction } from "@/lib/useDialogAction";
import { validateExternalRequestSimpleAction } from "@/lib/airtable/external-validation-actions";

// Validation sans champ supplémentaire : tous les partenaires hors Audika
// (entité partenaire) et SOFIP (durée d'engagement) — voir ExternalValidationTable.
export function ValidateExternalRequestSimpleButton({ locationId }: { locationId: string }) {
  const { dialogRef, pending, error, open, close, run } = useDialogAction();
  const titleId = `validate-simple-title-${locationId}`;

  function handleConfirm() {
    return run(() => validateExternalRequestSimpleAction(locationId));
  }

  return (
    <>
      <button type="button" className="btn btn-secondary btn-wide" onClick={open}>
        Valider la demande
      </button>
      <dialog ref={dialogRef} className="dialog" aria-labelledby={titleId} onClick={closeDialogOnBackdropClick}>
        <div className="dialog-body">
          <h3 id={titleId}>Valider cette demande ?</h3>
          <p className="text-muted">Êtes-vous certain de vouloir valider cette demande ?</p>
          {error && <p className="field-error">{error}</p>}
          <div className="dialog-footer">
            <button type="button" className="btn btn-ghost" onClick={close}>
              Annuler
            </button>
            <button type="button" className="btn btn-primary" disabled={pending} onClick={handleConfirm}>
              {pending ? "Envoi..." : "Valider"}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
