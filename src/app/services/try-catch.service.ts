import Mustache = require('mustache');

import { ExtensionConfig, LANGUAGE_PROFILES } from '../configs';
import { buildTryCatchRegexFromDeclaration } from '../helpers';
import { TryCatchDeclaration, TryCatchTemplate } from '../types';
import { TryCatchLanguageProfile, TryCatchSnippetVariables } from '../types';

const LANGUAGE_PROFILE_ENTRIES = LANGUAGE_PROFILES.map((profile) => {
  return [profile.language, profile] as const;
});

export class TryCatchService {
  private readonly profilesByLanguage: ReadonlyMap<
    string,
    TryCatchLanguageProfile
  > = new Map(LANGUAGE_PROFILE_ENTRIES);

  private templateOptions: Map<string, TryCatchTemplate[]> = new Map();

  constructor(readonly config: ExtensionConfig) {
    this.loadCustomTemplates();
  }

  private loadCustomTemplates(): void {
    this.templateOptions = new Map(
      LANGUAGE_PROFILES.map((profile) => {
        return [profile.language, [profile.template]];
      }),
    );

    const customTemplates = this.config.customTemplates ?? [];

    for (const template of customTemplates) {
      if (this.isValidTemplate(template)) {
        this.registerTemplate(template);
      }
    }
  }

  public reloadCustomTemplates(): void {
    this.loadCustomTemplates();
  }

  private isValidTemplate(template: unknown): template is TryCatchTemplate {
    if (!template || typeof template !== 'object') {
      return false;
    }

    const candidate = template as Partial<TryCatchTemplate>;

    return (
      typeof candidate.language === 'string' &&
      Array.isArray(candidate.tryBlock) &&
      Array.isArray(candidate.catchBlock)
    );
  }

  async generateTryCatchSnippet(
    languageId: string,
    variables: TryCatchSnippetVariables,
    options?: { templateFingerprint?: string },
  ): Promise<string> {
    const template = this.getTemplateByLanguage(
      languageId,
      options?.templateFingerprint,
    );

    if (!template) {
      throw new Error(
        `Language "${languageId}" is not supported for try/catch blocks.`,
      );
    }

    const renderedVariables = {
      ...variables,
    };

    const tryBlock = template.tryBlock
      .filter((line) => {
        return (
          !(
            line.includes('{{followUpStatement}}') ||
            line.includes('{{{followUpStatement}}}')
          ) || renderedVariables.followUpStatement.trim().length > 0
        );
      })
      .map((line) => {
        return Mustache.render(line, renderedVariables).replace(/[ \t]+$/, '');
      })
      .join('\n');

    const catchBlock = template.catchBlock
      .filter((line) => {
        return (
          !(
            line.includes('{{followUpStatement}}') ||
            line.includes('{{{followUpStatement}}}')
          ) || renderedVariables.followUpStatement.trim().length > 0
        );
      })
      .map((line) => {
        return Mustache.render(line, renderedVariables).replace(/[ \t]+$/, '');
      })
      .join('\n');

    const payload = renderedVariables.selectedCode ?? '';

    if (!payload.length) {
      return `${tryBlock}\n${catchBlock}`;
    }

    return `${tryBlock}\n${payload}\n${catchBlock}`;
  }

  public isAlreadyWrapped(code: string, languageId: string): boolean {
    const declaration = this.getLanguageDeclaration(languageId);
    const regex = buildTryCatchRegexFromDeclaration(declaration);

    if (!regex) {
      return false;
    }

    const detectionRegex = new RegExp(
      regex.source,
      regex.flags.replace('g', ''),
    );

    return detectionRegex.test(code);
  }

  public getStructureDetectionRegex(languageId: string): RegExp | null {
    const declaration = this.getLanguageDeclaration(languageId);
    return buildTryCatchRegexFromDeclaration(declaration);
  }

  public extractGeneratedPayload(
    languageId: string,
    snippet: string,
    removalIndent?: string,
  ): { payload: string } | null {
    const detectionRegex = this.getStructureDetectionRegex(languageId);

    if (!detectionRegex) {
      return null;
    }

    detectionRegex.lastIndex = 0;
    const match = detectionRegex.exec(snippet);

    if (!match) {
      return null;
    }

    const prefix = snippet.slice(0, match.index);
    const suffix = snippet.slice(match.index + match[0].length);

    if (prefix.trim().length > 0 || suffix.trim().length > 0) {
      return null;
    }

    let payload = match[1] ?? '';

    if (removalIndent) {
      const trailingWhitespace = payload.match(/\n([ \t]+)$/);

      if (trailingWhitespace) {
        payload = payload.slice(0, -trailingWhitespace[1].length);
      }
    }

    return { payload };
  }

  private getLanguageProfile(
    languageId: string,
  ): TryCatchLanguageProfile | undefined {
    return this.profilesByLanguage.get(languageId);
  }

  private getLanguageDeclaration(
    languageId: string,
  ): TryCatchDeclaration | undefined {
    return this.getLanguageProfile(languageId)?.declaration;
  }

  getTemplateByLanguage(
    language: string,
    _fingerprint?: string,
  ): TryCatchTemplate | undefined {
    const options = this.templateOptions.get(language);

    if (!options?.length) {
      return undefined;
    }

    return options[0];
  }

  registerTemplate(template: TryCatchTemplate): void {
    const options = this.templateOptions.get(template.language) ?? [];

    options.push(template);

    this.templateOptions.set(template.language, options);
  }
}
