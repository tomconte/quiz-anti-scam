import { describe, expect, it } from 'vitest';
import { resolveImageByQuestionId } from './images';

describe('image resolver', () => {
  it('resolves known question image by q{id:02d}_ prefix', () => {
    const image = resolveImageByQuestionId(1);
    expect(image).toBeTruthy();
  });

  it('returns null for missing question image', () => {
    expect(resolveImageByQuestionId(999)).toBeNull();
  });
});
