"use client";

import { useState } from "react";
import { downloadXlsx, type XlsxRow } from "@/lib/export-xlsx";
import { DownloadIcon } from "@/components/ui/icons";

// Bouton générique réutilisé par chaque tableau de l'app : les lignes sont
// déjà préparées côté serveur (un objet plat colonne → valeur, dans le même
// ordre et avec les mêmes libellés que les colonnes visibles à l'écran —
// sauf les dates et les montants, exportés en valeur brute plutôt qu'en
// texte formaté, voir toExportDate) et passées telles quelles — ce
// composant ne fait que déclencher le téléchargement du fichier.
export function ExportXlsButton({
  rows,
  filename,
  sheetName,
}: {
  rows: XlsxRow[];
  filename: string;
  sheetName?: string;
}) {
  const [pending, setPending] = useState(false);

  async function handleClick() {
    setPending(true);
    try {
      await downloadXlsx(filename, rows, sheetName);
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      className="btn btn-secondary flex items-center gap-2"
      onClick={handleClick}
      disabled={pending || rows.length === 0}
    >
      <DownloadIcon />
      {pending ? "Export…" : "Exporter en XLS"}
    </button>
  );
}
