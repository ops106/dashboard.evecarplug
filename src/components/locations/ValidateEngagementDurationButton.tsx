"use client";

import { useState } from "react";
import { closeDialogOnBackdropClick, useDialogAction } from "@/lib/useDialogAction";
import { validateExternalRequestWithDurationAction } from "@/lib/airtable/external-validation-actions";
import { ENGAGEMENT_DURATION_CHOICES } from "@/lib/airtable/fields";

// Spécificité SOFIP : la validation demande de choisir une durée
// d'engagement plutôt qu'une entité partenaire (réservée à Audika, voir
// ValidateExternalRequestButton) — voir ExternalValidationTable.
export function ValidateEngagementDurationButton({ locationId }: { locationId: string }) {
  const { dialogRef, pending, error, setError, open, close, run } = useDialogAction();
  const [selected, setSelected] = useState<string>(ENGAGEMENT_DURATION_CHOICES[0]);
  const titleId = `validate-duration-title-${locationId}`;

  function openDialog() {
    setSelected(ENGAGEMENT_DURATION_CHOICES[0]);
    open();
  }

  async function handleSubmit() {
    if (!selected) {
      setError("Choisissez une durée d'engagement.");
      return;
    }
    await run(() => validateExternalRequestWithDurationAction(locationId, selected));
  }

  return (
    <>
      <button type="button" className="btn btn-secondary btn-wide" onClick={openDialog}>
        Valider la demande
      </button>
      <dialog ref={dialogRef} className="dialog" aria-labelledby={titleId} onClick={closeDialogOnBackdropClick}>
        <form action={handleSubmit} className="dialog-body">
          <h3 id={titleId}>Durée d&apos;engagement</h3>
          <div className="field">
            <label htmlFor={`duree-${locationId}`}>Durée d&apos;engagement</label>
            <select
              id={`duree-${locationId}`}
              className="input"
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
            >
              {ENGAGEMENT_DURATION_CHOICES.map((duree) => (
                <option key={duree} value={duree}>
                  {duree}
                </option>
              ))}
            </select>
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
