import { Navigate, useNavigate } from 'react-router-dom';
import { getScore, useQuizStore } from '../features/quiz/store';
import { quizDatabase } from '../features/quiz/data';
import { resolveImageByQuestionId } from '../features/quiz/images';

function formatScenarioContent(content: Record<string, unknown>): string {
  return Object.entries(content)
    .map(([key, value]) => `${key}: ${String(value)}`)
    .join('\n');
}

export function QuizPage(): JSX.Element {
  const navigate = useNavigate();
  const { currentIndex, answers, completed, submitAnswer, next } = useQuizStore();

  if (completed) {
    return <Navigate to="/result" replace />;
  }

  const question = quizDatabase.questions[currentIndex];
  if (!question) {
    return <Navigate to="/" replace />;
  }

  const selected = answers[question.id];
  const imageUrl = resolveImageByQuestionId(question.id);
  const isCorrect = selected === question.correct_answer;
  const canContinue = Boolean(selected);

  const isLast = currentIndex === quizDatabase.questions.length - 1;

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between text-sm text-slate-300">
        <span>Question {currentIndex + 1} / {quizDatabase.questions.length}</span>
        <span className="rounded-full border border-slate-700 px-3 py-1">{question.difficulty}</span>
      </div>

      <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 md:p-7">
        <h1 className="text-2xl font-bold">{question.title}</h1>
        <p className="mt-2 text-slate-300">{question.scenario.description}</p>

        {imageUrl ? (
          <div className="relative mt-5">
            <img
              className="max-h-[340px] w-full rounded-xl border border-slate-800 bg-slate-950 object-contain"
              src={imageUrl}
              alt={`Illustration: ${question.title}`}
            />
            {selected && question.indicators.length > 0 && (
              <div className="absolute inset-x-3 bottom-3 rounded-lg border border-slate-300/20 bg-slate-950/70 p-3 backdrop-blur-sm md:inset-x-4 md:bottom-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-cyan-200">
                  Indices à repérer
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-slate-100 md:text-sm">
                  {question.indicators.map((indicator) => (
                    <li key={indicator}>{indicator}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-5 rounded-xl border border-dashed border-slate-700 bg-slate-950/40 p-6 text-sm text-slate-400">
            Illustration indisponible pour cette question.
          </div>
        )}

        <pre className="mt-5 overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-200 whitespace-pre-wrap">
          {formatScenarioContent(question.scenario.simulated_content)}
        </pre>

        <h2 className="mt-5 text-lg font-semibold">{question.question}</h2>
        <div className="mt-3 grid gap-3">
          {question.options.map((option) => {
            const checked = selected === option.id;
            return (
              <button
                key={option.id}
                className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                  checked
                    ? 'border-cyan-300 bg-cyan-400/10 text-cyan-100'
                    : 'border-slate-700 bg-slate-900/40 text-slate-200 hover:border-slate-500'
                }`}
                onClick={() => submitAnswer(question.id, option.id)}
                type="button"
              >
                <span className="font-semibold">{option.id}.</span> {option.text}
              </button>
            );
          })}
        </div>

        {selected && (
          <div className="mt-5 rounded-xl border border-slate-700 bg-slate-950/50 p-4">
            <p className={`font-semibold ${isCorrect ? 'text-emerald-300' : 'text-amber-200'}`}>
              {isCorrect ? 'Bonne réponse' : 'Réponse incorrecte'}
            </p>
            <p className="mt-2 text-sm text-slate-300">{question.explanation}</p>
          </div>
        )}
      </article>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium hover:border-slate-500"
          onClick={() => navigate('/')}
          type="button"
        >
          Quitter
        </button>

        <div className="flex items-center gap-3">
          <p className="text-sm text-slate-300">Score actuel: {getScore().correct}</p>
          <button
            className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
            disabled={!canContinue}
            onClick={() => next()}
            type="button"
          >
            {isLast ? 'Voir mes résultats' : 'Question suivante'}
          </button>
        </div>
      </div>
    </section>
  );
}
