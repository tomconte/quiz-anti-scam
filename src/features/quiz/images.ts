const imageModules = import.meta.glob('../../../data/quiz_images/q*.png', {
  eager: true,
  import: 'default'
}) as Record<string, string>;

const QUESTION_ID_REGEX = /\/q(\d{2})_/;

export function resolveImageByQuestionId(questionId: number): string | null {
  const paddedId = questionId.toString().padStart(2, '0');

  for (const [path, assetUrl] of Object.entries(imageModules)) {
    const match = QUESTION_ID_REGEX.exec(path);
    if (match && match[1] === paddedId) {
      return assetUrl;
    }
  }

  return null;
}
