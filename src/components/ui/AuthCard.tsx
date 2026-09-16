import Image from "next/image";
import { Card } from "@/components/ui/Card";

// Habillage commun aux 3 écrans du parcours de connexion (login, mot de
// passe oublié, définir mot de passe) : dégradé de fond, liseré accent en
// haut de carte, logo — pour rester cohérent visuellement sur tout le flux.
export function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{ background: "radial-gradient(60% 50% at 50% 0%, var(--color-accent-light) 0%, var(--color-bg) 70%)" }}
    >
      <Card className="w-full max-w-sm">
        <div
          style={{
            margin: "-20px -20px 24px",
            height: 4,
            background: "linear-gradient(90deg, var(--color-accent), var(--color-accent-dark))",
            borderRadius: "var(--radius-card) var(--radius-card) 0 0",
          }}
        />
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <Image src="/evecarplug-logo.svg" alt="EVE CAR PLUG" width={150} height={67} priority />
        </div>
        {children}
      </Card>
    </div>
  );
}
