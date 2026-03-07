import { z } from 'zod';

const optionSchema = z.object({
  id: z.string(),
  text: z.string(),
  is_correct: z.boolean()
});

const questionSchema = z.object({
  id: z.number().int().positive(),
  type: z.enum(['scenario_visuel', 'theorie', 'vrai_ou_faux', 'indice_a_reperer']),
  category: z.string(),
  channel: z.string(),
  difficulty: z.enum(['debutant', 'intermediaire', 'avance']),
  verdict: z.preprocess(
    (value) => (value === undefined ? null : value),
    z.union([z.enum(['arnaque', 'legitime', 'suspect']), z.null()])
  ),
  title: z.string(),
  scenario: z.object({
    description: z.string(),
    simulated_content: z.preprocess(
      (value) => (value === undefined ? {} : value),
      z.record(z.unknown())
    )
  }),
  question: z.string(),
  options: z.array(optionSchema).min(2),
  correct_answer: z.string(),
  indicators: z.array(z.string()),
  explanation: z.string(),
  source_context: z.string(),
  pairs_with: z.number().int().positive().optional(),
  key_lesson: z.string().optional(),
  risks: z.array(z.string()).optional(),
  official_verification: z.string().optional()
});

export const quizDatabaseSchema = z.object({
  metadata: z.object({
    version: z.string(),
    total_questions: z.number().int().positive(),
    language: z.string()
  }),
  questions: z.array(questionSchema).min(1)
});
