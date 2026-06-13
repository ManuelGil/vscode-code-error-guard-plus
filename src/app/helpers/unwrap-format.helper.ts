import { TryCatchDeclaration } from '../types';

export function buildTryCatchRegexFromDeclaration(
  declaration?: TryCatchDeclaration,
): RegExp | null {
  if (!declaration) {
    return null;
  }

  const normalizeLineEndings = (pattern: string): string => {
    return pattern.replace(/\\n/g, '\\r?\\n');
  };

  const patternParts = [
    normalizeLineEndings(declaration.tryDeclaration),
    // Consume a single line break between the try declaration and the payload
    // so the captured group does not include the leading newline that
    // belongs to the wrapper structure.
    '(?:\\r?\\n)?',
    '([\\s\\S]*?)',
    normalizeLineEndings(declaration.catchDeclaration),
    '([\\s\\S]*?)',
  ];

  if (declaration.closing) {
    patternParts.push(normalizeLineEndings(declaration.closing));
  }

  return new RegExp(patternParts.join(''), 'g');
}
