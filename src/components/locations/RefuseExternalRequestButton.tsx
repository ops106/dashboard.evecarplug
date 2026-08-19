"use client";

import { closeDialogOnBackdropClick, useDialogAction } from "@/lib/useDialogAction";
import { refuseExternalRequestAction } from "@/lib/airtable/external-validation-actions";

export function RefuseExternalRequestButton({ locationId }: { locationId: string }) {
  const { dialogRef, pending, error, open, close, run } = useDialogAction();
  const titleId = `refuse-external-title-${locationId}`;

  function handleConfirm() {
    return run(() => refuseExternalRequestAction(locationId));
  }

  return (
    <>
      <button type="button" className="btn btn-ghost btn-sm" onClick={open}>
        Refuser
      </button>
      <dialog ref={dialogRef} className="dialog" aria-labelledby={titleId} onClick={closeDialogOnBackdropClick}>
        <div className="dialog-body">
          <h3 id={titleId}>Refuser cette demande ?</h3>
          <p className="text-muted">Êtes-vous certain de vouloir refuser cette demande ?</p>
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
