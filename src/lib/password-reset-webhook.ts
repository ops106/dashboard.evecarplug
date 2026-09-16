import "server-only";

// Notifie un scenario Make (webhook custom -> Brevo) pour l'envoi du lien de
// definition/reinitialisation de mot de passe. Ne transporte jamais de mot
// de passe, seulement un lien signe a expiration — voir password-reset-token.ts.
// Fire-and-forget, ne doit jamais faire echouer l'appelant (meme logique que
// les autres webhooks Make de l'app).
export async function notifyPasswordResetRequested(params: {
  email: string;
  name: string;
  resetUrl: string;
}): Promise<void> {
  const webhookUrl = process.env.MAKE_PASSWORD_RESET_WEBHOOK_URL;
  if (!webhookUrl) {
    // Webhook non configure (dev local, ou envoi desactive volontairement) :
    // on logue le lien plutot que de l'envoyer, pour rester testable sans
    // declencher un vrai email.
    console.log(`[password-reset] MAKE_PASSWORD_RESET_WEBHOOK_URL non configuree — lien pour ${params.email} : ${params.resetUrl}`);
    return;
  }

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: params.email,
        name: params.name,
        resetUrl: params.resetUrl,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (error) {
    console.error("notifyPasswordResetRequested a échoué (action non bloquée) :", error);
  }
}
