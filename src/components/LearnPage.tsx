import { quizDatabase } from '../features/quiz/data';

export function LearnPage(): JSX.Element {
  const categories = Array.from(new Set(quizDatabase.questions.map((q) => q.category)));

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-black">Bibliothèque d'indices</h1>
        <p className="mt-2 text-slate-300">
          Retenez les signaux faibles: urgence, domaines non officiels, demandes de paiement, numéros inattendus.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <article key={category} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <h2 className="font-semibold text-cyan-200">{category}</h2>
            <p className="mt-2 text-sm text-slate-300">
              {quizDatabase.questions.filter((q) => q.category === category).length} question(s)
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
