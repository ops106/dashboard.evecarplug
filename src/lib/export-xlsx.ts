// Une ligne d'export : colonne → valeur. Un objet Date est écrit comme une
// vraie cellule date Excel (triable/filtrable), pas comme du texte formaté —
// voir toExportDate, utilisé par les colonnes de date de chaque tableau.
export type XlsxRow = Record<string, string | number | Date>;

// "—" (valeur absente) ou la chaîne brute si elle n'est pas une date valide,
// sinon un vrai objet Date — pour que l'export reste exploitable par un
// logiciel tiers (compta, CRM) plutôt que du texte à reparser.
export function toExportDate(value?: string): Date | string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date;
}

// Génère un fichier .xlsx côté client à partir de lignes déjà préparées et
// déclenche son téléchargement. Import dynamique de la librairie xlsx
// (~600 Ko) : elle ne doit alourdir le bundle qu'au moment où l'utilisateur
// clique réellement sur "Exporter", pas au chargement de la page — voir
// ExportXlsButton.
export async function downloadXlsx(filename: string, rows: XlsxRow[], sheetName = "Export"): Promise<void> {
  const XLSX = await import("xlsx");
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.slice(0, 31));
  XLSX.writeFile(workbook, filename);
}
