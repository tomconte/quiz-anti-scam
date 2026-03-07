import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { getScore, useQuizStore } from '../features/quiz/store';

export function ResultsPage(): JSX.Element {
  const navigate = useNavigate();
  const { restart } = useQuizStore();
  const score = getScore();
  const percent = Math.round((score.correct / score.total) * 100);

  return (
    <section className="mx-auto max-w-2xl rounded-2xl border border-slate-800 bg-slate-900/70 p-8 text-center">
      <p className="text-sm uppercase tracking-wide text-cyan-300">Quiz terminé</p>
      <h1 className="mt-2 text-3xl font-black">{score.correct} / {score.total}</h1>
      <p className="mt-2 text-slate-300">Taux de réussite: {percent}%</p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950"
          onClick={() => {
            restart();
            navigate('/quiz');
          }}
          type="button"
        >
          Recommencer
        </button>
        <Link className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold" to="/learn">
          Voir les conseils
        </Link>
      </div>
    </section>
  );
}
