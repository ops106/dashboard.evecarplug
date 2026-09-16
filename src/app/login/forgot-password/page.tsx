import Link from "next/link";
import { AuthCard } from "@/components/ui/AuthCard";
import { forgotPasswordAction } from "./actions";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>;
}) {
  const params = await searchParams;

  return (
    <AuthCard>
      {params.sent ? (
        <div className="space-y-4 text-center">
          <h1 style={{ fontSize: 20 }}>Vérifiez votre boîte mail</h1>
          <p className="text-sm text-muted">
            Si un compte existe avec cet email, un lien pour définir votre mot de passe vient de vous être envoyé.
            Il est valable 24 heures.
          </p>
          <Link href="/login" className="text-sm text-[var(--color-accent)] hover:underline">
            ← Retour à la connexion
          </Link>
        </div>
      ) : (
        <form action={forgotPasswordAction} className="space-y-4">
          <div className="text-center">
            <h1 style={{ fontSize: 20 }}>Mot de passe oublié</h1>
            <p className="mt-1 text-sm text-muted">
              Renseignez votre email, vous recevrez un lien pour définir un nouveau mot de passe.
            </p>
          </div>

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

          <button type="submit" className="btn btn-primary w-full">
            Envoyer le lien
          </button>

          <p className="text-sm text-center">
            <Link href="/login" className="text-muted hover:text-[var(--color-accent)]">
              ← Retour à la connexion
            </Link>
          </p>
        </form>
      )}
    </AuthCard>
  );
}
