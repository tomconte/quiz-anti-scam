import quizDataRaw from '../../../data/scam-quiz-database.json';
import { quizDatabaseSchema } from './schema';
import type { QuizDatabase } from './types';

const parsed = quizDatabaseSchema.safeParse(quizDataRaw);

if (!parsed.success) {
  throw new Error(`Invalid quiz dataset: ${parsed.error.message}`);
}

export const quizDatabase: QuizDatabase = parsed.data;
