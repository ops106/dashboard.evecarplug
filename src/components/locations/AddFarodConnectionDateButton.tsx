"use client";

import { useState } from "react";
import { closeDialogOnBackdropClick, useDialogAction } from "@/lib/useDialogAction";
import { setFirstFarodConnectionDateAction } from "@/lib/airtable/farod-actions";

export function AddFarodConnectionDateButton({ locationId }: { locationId: string }) {
  const { dialogRef, pending, error, setError, open, close, run } = useDialogAction();
  const [date, setDate] = useState("");
  const titleId = `add-farod-date-title-${locationId}`;

  function openDialog() {
    setDate("");
    open();
  }

  async function handleSubmit() {
    if (!date) {
      setError("Renseignez une date.");
      return;
    }
    await run(() => setFirstFarodConnectionDateAction(locationId, date));
  }

  return (
    <>
      <button type="button" className="btn btn-secondary btn-sm" onClick={openDialog}>
        Ajouter date 1ère connexion
      </button>
      <dialog ref={dialogRef} className="dialog" aria-labelledby={titleId} onClick={closeDialogOnBackdropClick}>
        <form action={handleSubmit} className="dialog-body">
          <h3 id={titleId}>Date de 1ère connexion Farod</h3>
          <div className="field">
            <label htmlFor={`farod-date-${locationId}`}>Date</label>
            <input
              id={`farod-date-${locationId}`}
              type="date"
              className="input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          {error && <p className="field-error">{error}</p>}
          <div className="dialog-footer">
            <button type="button" className="btn btn-ghost" onClick={close}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" disabled={pending}>
              {pending ? "Envoi..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
