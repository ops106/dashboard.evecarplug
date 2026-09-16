import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { verifyPasswordResetToken } from "@/lib/password-reset-token";
import { MIN_PASSWORD_LENGTH } from "@/lib/password";
import { setPasswordAction } from "./actions";

const ERROR_MESSAGES: Record<string, string> = {
  "too-short": `Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`,
  mismatch: "Les deux mots de passe ne correspondent pas.",
};

export default async function SetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const params = await searchParams;
  const claims = params.token ? await verifyPasswordResetToken(params.token) : null;

  if (!claims || params.error === "invalid-token") {
    return (
      <div className="flex min-h-screen items-center justify-center px-4" style={{ background: "var(--color-bg)" }}>
        <Card className="w-full max-w-sm space-y-4">
          <h1 style={{ fontSize: 20 }}>Lien invalide ou expiré</h1>
          <p className="text-sm text-muted">
            Ce lien n&apos;est plus valable (il expire au bout de 24 heures). Demandez-en un nouveau.
          </p>
          <Link href="/login/forgot-password" className="btn btn-primary w-full" style={{ textAlign: "center" }}>
            Demander un nouveau lien
          </Link>
        </Card>
      </div>
    );
  }

  const errorMessage = params.error ? ERROR_MESSAGES[params.error] : undefined;

  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ background: "var(--color-bg)" }}>
      <Card className="w-full max-w-sm">
        <form action={setPasswordAction} className="space-y-4">
          <div>
            <h1 style={{ fontSize: 20 }}>Définir votre mot de passe</h1>
            <p className="mt-1 text-sm text-muted">Compte : {claims.email}</p>
          </div>

          <input type="hidden" name="token" value={params.token} />

          <div className="field">
            <label htmlFor="password">Nouveau mot de passe</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={MIN_PASSWORD_LENGTH}
              autoFocus
              className="input"
            />
          </div>

          <div className="field">
            <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={MIN_PASSWORD_LENGTH}
              className="input"
            />
          </div>

          {errorMessage && (
            <p className="text-sm" style={{ color: "var(--color-danger)" }}>
              {errorMessage}
            </p>
          )}

          <button type="submit" className="btn btn-primary w-full">
            Valider
          </button>
        </form>
      </Card>
    </div>
  );
}
