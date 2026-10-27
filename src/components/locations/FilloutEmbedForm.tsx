"use client";

import { useEffect } from "react";

// Le snippet Airtable contient un <script> : insere via dangerouslySetInnerHTML,
// un navigateur ne l'execute jamais (securite). On retire ce <script> du HTML
// et on le recree nous-memes via le DOM a chaque montage, seule methode fiable
// pour qu'il s'execute (et re-scanne la page pour initialiser le formulaire).
export function FilloutEmbedForm({ embedHtml }: { embedHtml: string }) {
  const markup = embedHtml.replace(/<script[^>]*>[^<]*<\/script>/gi, "");

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://server.fillout.com/embed/v1/";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, [embedHtml]);

  return <div style={{ width: "100%", minHeight: 1000 }} dangerouslySetInnerHTML={{ __html: markup }} />;
}
