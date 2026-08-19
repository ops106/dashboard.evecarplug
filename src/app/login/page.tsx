import { Card } from "@/components/ui/Card";
import { loginAction } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;

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

          {params.error && (
            <p className="text-sm" style={{ color: "var(--color-danger)" }}>
              Cet email ne correspond à aucun compte interne.
            </p>
          )}

          <button type="submit" className="btn btn-primary w-full">
            Se connecter
          </button>
        </form>
      </Card>
    </div>
  );
}
