import { Link } from 'react-router-dom';
import { quizDatabase } from '../features/quiz/data';

export function HomePage(): JSX.Element {
  return (
    <section className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
      <div className="rounded-2xl border border-cyan-500/30 bg-slate-900/70 p-6 shadow-lg shadow-cyan-900/20">
        <p className="text-sm font-medium uppercase tracking-wide text-cyan-300">Public France</p>
        <h1 className="mt-2 text-3xl font-black leading-tight md:text-4xl">Repérez les arnaques avant de cliquer</h1>
        <p className="mt-4 text-slate-300">
          Entraînez-vous avec des scénarios réalistes SMS, email, WhatsApp et appels pour apprendre les bons réflexes anti-phishing.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            to="/quiz"
          >
            Commencer le quiz
          </Link>
          <Link
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-slate-500"
            to="/learn"
          >
            Voir les thèmes
          </Link>
        </div>
      </div>

      <aside className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <h2 className="text-lg font-semibold">Base actuelle</h2>
        <ul className="mt-3 space-y-2 text-sm text-slate-300">
          <li>{quizDatabase.metadata.total_questions} questions</li>
          <li>Canaux: SMS, email, WhatsApp, appel, QR code, courrier</li>
          <li>Niveaux: débutant à avancé</li>
          <li>Feedback pédagogique après chaque réponse</li>
        </ul>
      </aside>
    </section>
  );
}
