import { create } from 'zustand';
import { quizDatabase } from './data';

type SessionMode = 'quiz' | 'browse';

const QUIZ_QUESTION_COUNT = 10;

function shuffle<T>(items: T[]): T[] {
  const clone = [...items];

  for (let i = clone.length - 1; i > 0; i -= 1) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [clone[i], clone[randomIndex]] = [clone[randomIndex], clone[i]];
  }

  return clone;
}

function getRandomQuestionIds(): number[] {
  const ids = quizDatabase.questions.map((question) => question.id);
  return shuffle(ids).slice(0, QUIZ_QUESTION_COUNT);
}

interface QuizState {
  mode: SessionMode;
  questionIds: number[];
  currentIndex: number;
  answers: Record<number, string>;
  completed: boolean;
  startQuiz: () => void;
  startBrowse: () => void;
  submitAnswer: (questionId: number, optionId: string) => void;
  next: () => void;
  restart: () => void;
}

const STORAGE_KEY = 'quiz-anti-arnaque-v1';

function loadInitialState(): Pick<QuizState, 'mode' | 'questionIds' | 'currentIndex' | 'answers' | 'completed'> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        mode: 'quiz',
        questionIds: getRandomQuestionIds(),
        currentIndex: 0,
        answers: {},
        completed: false
      };
    }

    const parsed = JSON.parse(raw) as Pick<QuizState, 'mode' | 'questionIds' | 'currentIndex' | 'answers' | 'completed'>;

    const fallbackQuestionIds = parsed.mode === 'browse'
      ? quizDatabase.questions.map((question) => question.id)
      : getRandomQuestionIds();

    return {
      mode: parsed.mode ?? 'quiz',
      questionIds: parsed.questionIds?.length ? parsed.questionIds : fallbackQuestionIds,
      currentIndex: parsed.currentIndex ?? 0,
      answers: parsed.answers ?? {},
      completed: parsed.completed ?? false
    };
  } catch {
    return {
      mode: 'quiz',
      questionIds: getRandomQuestionIds(),
      currentIndex: 0,
      answers: {},
      completed: false
    };
  }
}

function persist(state: Pick<QuizState, 'mode' | 'questionIds' | 'currentIndex' | 'answers' | 'completed'>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const initial = loadInitialState();

export const useQuizStore = create<QuizState>((set, get) => ({
  mode: initial.mode,
  questionIds: initial.questionIds,
  currentIndex: initial.currentIndex,
  answers: initial.answers,
  completed: initial.completed,
  startQuiz: () => {
    const nextState = {
      mode: 'quiz' as SessionMode,
      questionIds: getRandomQuestionIds(),
      currentIndex: 0,
      answers: {},
      completed: false
    };
    persist(nextState);
    set(nextState);
  },
  startBrowse: () => {
    const nextState = {
      mode: 'browse' as SessionMode,
      questionIds: quizDatabase.questions.map((question) => question.id),
      currentIndex: 0,
      answers: {},
      completed: false
    };
    persist(nextState);
    set(nextState);
  },
  submitAnswer: (questionId, optionId) => {
    const nextAnswers = { ...get().answers, [questionId]: optionId };
    const nextState = {
      mode: get().mode,
      questionIds: get().questionIds,
      currentIndex: get().currentIndex,
      answers: nextAnswers,
      completed: get().completed
    };
    persist(nextState);
    set({ answers: nextAnswers });
  },
  next: () => {
    const isLastQuestion = get().currentIndex >= get().questionIds.length - 1;
    const nextState = {
      mode: get().mode,
      questionIds: get().questionIds,
      currentIndex: isLastQuestion ? get().currentIndex : get().currentIndex + 1,
      answers: get().answers,
      completed: isLastQuestion
    };
    persist(nextState);
    set(nextState);
  },
  restart: () => {
    const nextState = {
      mode: 'quiz' as SessionMode,
      questionIds: getRandomQuestionIds(),
      currentIndex: 0,
      answers: {},
      completed: false
    };
    persist(nextState);
    set(nextState);
  }
}));

export function getScore(): { total: number; correct: number } {
  const { answers, questionIds } = useQuizStore.getState();
  const questionsInSession = quizDatabase.questions.filter((question) => questionIds.includes(question.id));
  let correct = 0;

  for (const question of questionsInSession) {
    if (answers[question.id] === question.correct_answer) {
      correct += 1;
    }
  }

  return { total: questionsInSession.length, correct };
}

export function getSessionQuestions() {
  const { questionIds } = useQuizStore.getState();
  const questionsById = new Map(quizDatabase.questions.map((question) => [question.id, question]));

  return questionIds
    .map((questionId) => questionsById.get(questionId))
    .filter((question): question is NonNullable<typeof question> => Boolean(question));
}
