"use client";

import { useState } from "react";
import { SlideOver } from "@/components/ui/SlideOver";
import { EmptyState } from "@/components/ui/EmptyState";
import { PlusIcon } from "@/components/ui/icons";
import { FilloutEmbedForm } from "@/components/locations/FilloutEmbedForm";

// Bulle flottante (persona Apporteur d'affaires) plutôt qu'un lien dans la
// sidebar : ouvre le formulaire Fillout (voir getPartnerEmbedHtml) dans une
// modale glissante, accessible depuis n'importe quelle page de l'app.
export function NewRequestBubble({ embedHtml }: { embedHtml: string | null }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" className="new-request-bubble" onClick={() => setOpen(true)}>
        <PlusIcon />
        <span>Transmettre une demande</span>
      </button>
      {open && (
        <SlideOver title="Transmettre une demande" onClose={() => setOpen(false)}>
          {embedHtml ? (
            <FilloutEmbedForm embedHtml={embedHtml} />
          ) : (
            <EmptyState message="Aucun formulaire n'est configuré pour ce partenaire pour l'instant." />
          )}
        </SlideOver>
      )}
    </>
  );
}
