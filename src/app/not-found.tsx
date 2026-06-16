import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-x flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <div className="text-7xl">🥩</div>
      <h1 className="mt-6 font-display text-4xl font-medium">Page introuvable</h1>
      <p className="mt-2 max-w-md text-ink-700">
        La page que vous cherchez n'existe pas ou a été déplacée.
      </p>
      <Link href="/" className="btn-primary mt-6">
        Retour à l'accueil
      </Link>
    </div>
  );
}
