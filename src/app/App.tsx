import { Link, Navigate, Route, Routes } from 'react-router-dom';
import { HomePage } from '../components/HomePage';
import { LearnPage } from '../components/LearnPage';
import { QuizPage } from '../components/QuizPage';
import { ResultsPage } from '../components/ResultsPage';

export function App(): JSX.Element {
  return (
    <div className="min-h-screen text-slate-100">
      <header className="border-b border-slate-800/80 bg-slate-900/70 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 md:px-6">
          <Link className="text-lg font-semibold tracking-tight text-cyan-300" to="/">
            Quiz Anti-Arnaque
          </Link>
          <nav className="flex items-center gap-4 text-sm text-slate-300">
            <Link className="hover:text-white" to="/quiz">Quiz</Link>
            <Link className="hover:text-white" to="/learn">Apprendre</Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6 md:py-10">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/result" element={<ResultsPage />} />
          <Route path="/learn" element={<LearnPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
