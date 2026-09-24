import Image from "next/image";
import Link from "next/link";
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
    <div className="login-shell">
      <div className="login-hero">
        <div>
          <Image src="/evecarplug-logo-light.svg" alt="EVE CAR PLUG" width={128} height={57} priority />
          <p className="login-hero-eyebrow" style={{ marginTop: 28 }}>
            Suivi des bornes de recharge
          </p>
          <h1 className="login-hero-title">Le suivi de vos bornes, branché.</h1>
          <p className="login-hero-sub">
            Locations, déploiements et facturation des bornes de recharge, au même endroit.
          </p>
        </div>

        <svg
          className="login-hero-illustration"
          viewBox="0 0 260 300"
          width="100%"
          height="260"
          aria-hidden="true"
        >
          <path className="login-cable-path" d="M20 280 L20 200 L120 200 L120 110 L200 110 L200 55" />
          <circle className="login-cable-joint" cx="20" cy="200" r="3.5" />
          <circle className="login-cable-joint" cx="120" cy="200" r="3.5" />
          <circle className="login-cable-joint" cx="120" cy="110" r="3.5" />
          <circle className="login-cable-port" cx="200" cy="40" r="15" />
          <circle className="login-cable-dot" cx="200" cy="40" r="5" />
        </svg>

        <p className="login-hero-spec">TYPE 2 · 7,4—22 kW · 400 V</p>
      </div>

      <div className="login-form-panel">
        <div className="login-form-panel-inner">
          <form action={loginAction} className="space-y-5">
            <h2 style={{ fontSize: 20 }}>Connexion</h2>

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
              <p
                className="text-sm"
                style={{
                  color: "var(--color-danger)",
                  background: "var(--color-danger-bg)",
                  padding: "8px 12px",
                  borderRadius: "var(--radius-sm)",
                }}
              >
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
        </div>
      </div>
    </div>
  );
}
