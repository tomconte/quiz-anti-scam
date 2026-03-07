import { create } from 'zustand';
import { quizDatabase } from './data';

interface QuizState {
  currentIndex: number;
  answers: Record<number, string>;
  completed: boolean;
  submitAnswer: (questionId: number, optionId: string) => void;
  next: () => void;
  restart: () => void;
}

const STORAGE_KEY = 'quiz-anti-arnaque-v1';

function loadInitialState(): Pick<QuizState, 'currentIndex' | 'answers' | 'completed'> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { currentIndex: 0, answers: {}, completed: false };
    }

    const parsed = JSON.parse(raw) as Pick<QuizState, 'currentIndex' | 'answers' | 'completed'>;
    return {
      currentIndex: parsed.currentIndex ?? 0,
      answers: parsed.answers ?? {},
      completed: parsed.completed ?? false
    };
  } catch {
    return { currentIndex: 0, answers: {}, completed: false };
  }
}

function persist(state: Pick<QuizState, 'currentIndex' | 'answers' | 'completed'>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const initial = loadInitialState();

export const useQuizStore = create<QuizState>((set, get) => ({
  currentIndex: initial.currentIndex,
  answers: initial.answers,
  completed: initial.completed,
  submitAnswer: (questionId, optionId) => {
    const nextAnswers = { ...get().answers, [questionId]: optionId };
    const nextState = {
      currentIndex: get().currentIndex,
      answers: nextAnswers,
      completed: get().completed
    };
    persist(nextState);
    set({ answers: nextAnswers });
  },
  next: () => {
    const isLastQuestion = get().currentIndex >= quizDatabase.questions.length - 1;
    const nextState = {
      currentIndex: isLastQuestion ? get().currentIndex : get().currentIndex + 1,
      answers: get().answers,
      completed: isLastQuestion
    };
    persist(nextState);
    set(nextState);
  },
  restart: () => {
    const nextState = { currentIndex: 0, answers: {}, completed: false };
    persist(nextState);
    set(nextState);
  }
}));

export function getScore(): { total: number; correct: number } {
  const { answers } = useQuizStore.getState();
  let correct = 0;

  for (const question of quizDatabase.questions) {
    if (answers[question.id] === question.correct_answer) {
      correct += 1;
    }
  }

  return { total: quizDatabase.questions.length, correct };
}
