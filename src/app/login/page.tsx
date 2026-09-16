import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { loginAction } from "./actions";

const ERROR_MESSAGES: Record<string, string> = {
  account: "Cet email ne correspond à aucun compte interne.",
  password: "Mot de passe incorrect.",
  "no-password": "Aucun mot de passe défini pour ce compte. Utilisez « Mot de passe oublié ? » pour en créer un.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  const errorMessage = params.error ? ERROR_MESSAGES[params.error] : undefined;

  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ background: "var(--color-bg)" }}>
      <Card className="w-full max-w-sm">
        <form action={loginAction} className="space-y-4">
          <div>
            <h1 style={{ fontSize: 20 }}>Suivi des locations de bornes</h1>
            <p className="mt-1 text-sm text-muted">Outil interne — réservé aux membres de l&apos;équipe.</p>
          </div>

          <input type="hidden" name="next" value={params.next ?? "/"} />

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="prenom.nom@evecarplug.com"
              required
              autoFocus
              className="input"
            />
          </div>

          <div className="field">
            <label htmlFor="password">Mot de passe</label>
            <input id="password" name="password" type="password" required className="input" />
          </div>

          {errorMessage && (
            <p className="text-sm" style={{ color: "var(--color-danger)" }}>
              {errorMessage}
            </p>
          )}

          <button type="submit" className="btn btn-primary w-full">
            Se connecter
          </button>

          <p className="text-sm text-center">
            <Link href="/login/forgot-password" className="text-muted hover:text-[var(--color-accent)]">
              Mot de passe oublié ?
            </Link>
          </p>
        </form>
      </Card>
    </div>
  );
}
