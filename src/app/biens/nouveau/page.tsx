import Link from 'next/link';

export default function NouveauBienPage() {
  return (
    <main className="min-h-screen bg-sand px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-3xl rounded-2xl border border-cream-border bg-cream p-6">
        <h1 className="text-xl font-semibold text-sand-dark">Ajouter un bien</h1>
        <p className="mt-2 text-sm text-sand-dark/80">
          Cette page peut accueillir votre formulaire de création. Le listing est déjà prêt dans <code>/biens</code>.
        </p>
        <Link href="/biens" className="mt-4 inline-flex rounded-xl border border-cream-border bg-sand px-3 py-2 text-xs text-sand-dark">
          Retour à la liste
        </Link>
      </div>
    </main>
  );
}
