"use client";

import Link from "next/link";
import { useRef } from "react";
import { closeDialogOnBackdropClick, useDialogAction } from "@/lib/useDialogAction";
import { createTerminationRequestAction } from "@/lib/airtable/termination-actions";

export function TerminationRequestButton({
  locationId,
  disabled = false,
}: {
  locationId: string;
  disabled?: boolean;
}) {
  const { dialogRef: confirmDialogRef, pending, error, open: openConfirm, close: closeConfirm, run } = useDialogAction();
  const successRef = useRef<HTMLDialogElement>(null);
  const confirmTitleId = `termination-title-${locationId}`;

  async function handleConfirm() {
    const ok = await run(() => createTerminationRequestAction(locationId));
    if (ok) successRef.current?.showModal();
  }

  return (
    <>
      <button
        type="button"
        className="btn btn-danger"
        onClick={openConfirm}
        disabled={disabled}
        title={disabled ? "Une demande de résiliation est déjà en cours" : undefined}
      >
        Résiliation
      </button>

      <dialog
        ref={confirmDialogRef}
        className="dialog"
        aria-labelledby={confirmTitleId}
        onClick={closeDialogOnBackdropClick}
      >
        <div className="dialog-body">
          <h3 id={confirmTitleId}>Résilier ce contrat de location ?</h3>
          <p className="text-muted">Êtes-vous certain de vouloir faire une demande de résiliation ?</p>
          {error && <p className="field-error">{error}</p>}
          <div className="dialog-footer">
            <button type="button" className="btn btn-ghost" onClick={closeConfirm}>
              Annuler
            </button>
            <button type="button" className="btn btn-danger-solid" disabled={pending} onClick={handleConfirm}>
              {pending ? "Envoi..." : "Valider"}
            </button>
          </div>
        </div>
      </dialog>

      <dialog
        ref={successRef}
        className="dialog"
        aria-label="Demande de résiliation transmise"
        onClick={closeDialogOnBackdropClick}
      >
        <div className="dialog-body">
          <p>
            La demande de résiliation a bien été transmise, pour suivre l&apos;évolution de cette demande, aller sur
            la page <Link href="/">Tableau de bord</Link>.
          </p>
          <div className="dialog-footer">
            <button type="button" className="btn btn-primary" onClick={() => successRef.current?.close()}>
              Fermer
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
