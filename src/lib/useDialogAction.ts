import { useRef, useState } from "react";

// Ferme le <dialog> quand le clic touche le fond assombri (::backdrop) et non
// son contenu. Fonctionne car un clic sur le backdrop remonte avec
// e.target === le <dialog> lui-même, contrairement à un clic sur son contenu.
export function closeDialogOnBackdropClick(e: React.MouseEvent<HTMLDialogElement>) {
  if (e.target === e.currentTarget) e.currentTarget.close();
}

// Logique commune à toutes les popups d'action de ce projet : ouverture avec
// reset de l'erreur, fermeture, et exécution d'une Server Action avec état
// pending/erreur. `run` retourne un booléen (pas la valeur de `error`, qui
// resterait obsolète dans une closure juste après l'appel) pour permettre
// d'enchaîner une action au succès (ex: ouvrir une popup de confirmation).
export function useDialogAction() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function open() {
    setError(null);
    dialogRef.current?.showModal();
  }

  function close() {
    dialogRef.current?.close();
  }

  async function run(action: () => Promise<void>, options?: { closeOnSuccess?: boolean }): Promise<boolean> {
    setPending(true);
    setError(null);
    try {
      await action();
      if (options?.closeOnSuccess ?? true) close();
      return true;
    } catch {
      setError("Une erreur est survenue, réessayez.");
      return false;
    } finally {
      setPending(false);
    }
  }

  return { dialogRef, pending, error, setError, open, close, run };
}
