"use client";

import { useState } from "react";
import { closeDialogOnBackdropClick, useDialogAction } from "@/lib/useDialogAction";
import { validateExternalRequestAction } from "@/lib/airtable/external-validation-actions";

const ADD_NEW_VALUE = "__new__";

export function ValidateExternalRequestButton({
  locationId,
  availableEntities,
}: {
  locationId: string;
  availableEntities: string[];
}) {
  const { dialogRef, pending, error, setError, open, close, run } = useDialogAction();
  const [selected, setSelected] = useState<string>(availableEntities[0] ?? ADD_NEW_VALUE);
  const [newEntity, setNewEntity] = useState("");
  const titleId = `validate-entity-title-${locationId}`;

  function openDialog() {
    setSelected(availableEntities[0] ?? ADD_NEW_VALUE);
    setNewEntity("");
    open();
  }

  async function handleSubmit() {
    const entity = selected === ADD_NEW_VALUE ? newEntity.trim() : selected;
    if (!entity) {
      setError("Renseignez une entité partenaire.");
      return;
    }
    await run(() => validateExternalRequestAction(locationId, entity));
  }

  return (
    <>
      <button type="button" className="btn btn-secondary btn-wide" onClick={openDialog}>
        Valider la demande
      </button>
      <dialog ref={dialogRef} className="dialog" aria-labelledby={titleId} onClick={closeDialogOnBackdropClick}>
        <form action={handleSubmit} className="dialog-body">
          <h3 id={titleId}>Entité partenaire</h3>
          <div className="field">
            <label htmlFor={`entite-${locationId}`}>Entité partenaire</label>
            <select
              id={`entite-${locationId}`}
              className="input"
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
            >
              {availableEntities.map((entity) => (
                <option key={entity} value={entity}>
                  {entity}
                </option>
              ))}
              <option value={ADD_NEW_VALUE}>+ Ajouter une nouvelle entité</option>
            </select>
          </div>
          {selected === ADD_NEW_VALUE && (
            <div className="field">
              <label htmlFor={`nouvelle-entite-${locationId}`}>Nouvelle entité</label>
              <input
                id={`nouvelle-entite-${locationId}`}
                className="input"
                value={newEntity}
                onChange={(e) => setNewEntity(e.target.value)}
                required
              />
            </div>
          )}
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
