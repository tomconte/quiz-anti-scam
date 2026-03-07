import { describe, expect, it } from 'vitest';
import { quizDatabase } from './data';

describe('quiz dataset', () => {
  it('loads and exposes expected metadata', () => {
    expect(quizDatabase.metadata.version).toBe('2.0');
    expect(quizDatabase.questions.length).toBeGreaterThan(0);
  });

  it('has deterministic ids and valid correct answers', () => {
    for (const question of quizDatabase.questions) {
      const optionIds = question.options.map((opt) => opt.id);
      expect(optionIds).toContain(question.correct_answer);
      expect(question.id).toBeGreaterThan(0);
    }
  });
});
