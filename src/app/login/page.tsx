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
            <p className="mt-1 text-sm text-muted">Outil interne — mot de passe requis.</p>
          </div>

          <input type="hidden" name="next" value={params.next ?? "/"} />

          <div className="field">
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoFocus
              className="input"
            />
          </div>

          {params.error && <p className="text-sm" style={{ color: "var(--color-danger)" }}>Mot de passe incorrect.</p>}

          <button type="submit" className="btn btn-primary w-full">
            Se connecter
          </button>
        </form>
      </Card>
    </div>
  );
}
