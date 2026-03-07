import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { getScore, useQuizStore } from '../features/quiz/store';

function getEncouragement(percent: number): string {
  if (percent >= 90) {
    return 'Excellent réflexe : vous repérez très bien les signaux d’arnaque.';
  }

  if (percent >= 70) {
    return 'Très bon résultat : continuez comme ça, vous êtes sur la bonne voie.';
  }

  if (percent >= 50) {
    return 'Bon début : encore un peu d’entraînement et vous gagnerez en confiance.';
  }

  return 'Chaque essai aide à progresser : vous faites déjà le plus important en vous entraînant.';
}

export function ResultsPage(): JSX.Element {
  const navigate = useNavigate();
  const { startQuiz, startBrowse } = useQuizStore();
  const score = getScore();
  const percent = Math.round((score.correct / score.total) * 100);
  const encouragement = getEncouragement(percent);

  return (
    <section className="mx-auto max-w-2xl rounded-2xl border border-slate-800 bg-slate-900/70 p-8 text-center">
      <p className="text-sm uppercase tracking-wide text-cyan-300">Quiz terminé</p>
      <h1 className="mt-2 text-3xl font-black">{score.correct} / {score.total}</h1>
      <p className="mt-2 text-slate-300">Taux de réussite: {percent}%</p>
      <p className="mt-3 text-sm text-cyan-100">{encouragement}</p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950"
          onClick={() => {
            startQuiz();
            navigate('/quiz');
          }}
          type="button"
        >
          Refaire un quiz (10 questions aléatoires)
        </button>
        <button
          className="rounded-lg border border-cyan-500/50 px-4 py-2 text-sm font-semibold text-cyan-200"
          onClick={() => {
            startBrowse();
            navigate('/quiz');
          }}
          type="button"
        >
          Explorer toutes les questions
        </button>
        <Link className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold" to="/learn">
          Voir les conseils
        </Link>
      </div>
    </section>
  );
}
