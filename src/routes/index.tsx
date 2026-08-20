import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const FocusFlipApp = lazy(() => import("../focusflip/App"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FocusFlip — Odaklanma & Flip-Clock Zamanlayıcı" },
      {
        name: "description",
        content:
          "7 estetik tema, ambient ses karıştırıcı, nefes egzersizi ve motivasyon sözleriyle flip-clock odaklanma zamanlayıcısı.",
      },
      { property: "og:title", content: "FocusFlip — Odaklanma & Flip-Clock Zamanlayıcı" },
      {
        property: "og:description",
        content:
          "Pomodoro ve kronometre modları, ambient sesler ve nefes egzersizi ile estetik odaklanma zamanlayıcısı.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <ClientOnly fallback={<div className="min-h-screen bg-[#0a0118]" />}>
      <Suspense fallback={<div className="min-h-screen bg-[#0a0118]" />}>
        <FocusFlipApp />
      </Suspense>
    </ClientOnly>
  );
}
