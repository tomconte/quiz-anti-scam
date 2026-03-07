export type Verdict = 'arnaque' | 'legitime' | 'suspect' | null;

export type QuestionType =
  | 'scenario_visuel'
  | 'theorie'
  | 'vrai_ou_faux'
  | 'indice_a_reperer';

export type Difficulty = 'debutant' | 'intermediaire' | 'avance';

export interface QuizOption {
  id: string;
  text: string;
  is_correct: boolean;
}

export interface QuizQuestion {
  id: number;
  type: QuestionType;
  category: string;
  channel: string;
  difficulty: Difficulty;
  verdict: Verdict;
  title: string;
  scenario: {
    description: string;
    simulated_content: Record<string, unknown>;
  };
  question: string;
  options: QuizOption[];
  correct_answer: string;
  indicators: string[];
  explanation: string;
  source_context: string;
  pairs_with?: number;
  key_lesson?: string;
  risks?: string[];
  official_verification?: string;
}

export interface QuizDatabase {
  metadata: {
    version: string;
    total_questions: number;
    language: string;
  };
  questions: QuizQuestion[];
}
