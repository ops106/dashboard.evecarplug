"use client";

import { closeDialogOnBackdropClick, useDialogAction } from "@/lib/useDialogAction";
import { createRelocationRequestAction } from "@/lib/airtable/relocation-actions";

export function RelocationRequestButton({
  locationId,
  disabled = false,
}: {
  locationId: string;
  disabled?: boolean;
}) {
  const { dialogRef, pending, error, open, close, run } = useDialogAction();
  const titleId = `relocation-title-${locationId}`;

  async function handleSubmit(formData: FormData) {
    await run(() => createRelocationRequestAction(locationId, formData));
  }

  return (
    <>
      <button
        type="button"
        className="btn btn-secondary"
        onClick={open}
        disabled={disabled}
        title={disabled ? "Une demande de déménagement est déjà en cours" : undefined}
      >
        Déménagement
      </button>
      <dialog ref={dialogRef} className="dialog" aria-labelledby={titleId} onClick={closeDialogOnBackdropClick}>
        <form action={handleSubmit} className="dialog-body">
          <h3 id={titleId}>Signaler un déménagement</h3>
          <div className="field">
            <label htmlFor={`nouvelleAdresse-${locationId}`}>Nouvelle adresse</label>
            <input id={`nouvelleAdresse-${locationId}`} name="nouvelleAdresse" className="input" required />
          </div>
          <div className="field">
            <label htmlFor={`nouveauCp-${locationId}`}>Nouveau CP</label>
            <input id={`nouveauCp-${locationId}`} name="nouveauCp" className="input" required />
          </div>
          <div className="field">
            <label htmlFor={`nouvelleVille-${locationId}`}>Nouvelle ville</label>
            <input id={`nouvelleVille-${locationId}`} name="nouvelleVille" className="input" required />
          </div>
          {error && <p className="field-error">{error}</p>}
          <div className="dialog-footer">
            <button type="button" className="btn btn-ghost" onClick={close}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" disabled={pending}>
              {pending ? "Envoi..." : "Valider"}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
