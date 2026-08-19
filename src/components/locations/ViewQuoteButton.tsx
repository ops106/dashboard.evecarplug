"use client";

import { useRef } from "react";
import { closeDialogOnBackdropClick } from "@/lib/useDialogAction";

export function ViewQuoteButton({ locationId, quoteLink }: { locationId: string; quoteLink?: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = `view-quote-title-${locationId}`;

  return (
    <>
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => dialogRef.current?.showModal()}>
        Voir le devis
      </button>
      <dialog
        ref={dialogRef}
        className="dialog dialog-lg"
        aria-labelledby={titleId}
        onClick={closeDialogOnBackdropClick}
      >
        <div className="dialog-body">
          <h3 id={titleId}>Devis</h3>
          {quoteLink ? (
            <iframe src={quoteLink} className="dialog-quote-frame" title="Devis" />
          ) : (
            <p className="text-muted">Aucun lien de devis renseigné.</p>
          )}
          <div className="dialog-footer">
            <button type="button" className="btn btn-secondary" onClick={() => dialogRef.current?.close()}>
              Fermer
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
