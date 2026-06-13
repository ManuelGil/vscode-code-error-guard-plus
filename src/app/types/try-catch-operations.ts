import { TryCatchTemplate } from './template';
import { TryCatchDeclaration } from './try-catch-declaration';

export interface TryCatchSnippetVariables {
  indent: string;
  indentUnit: string;
  errorVar: string;
  catchContent: string;
  followUpStatement: string;
  selectedCode: string;
}

export interface TryCatchLanguageProfile {
  language: string;
  template: TryCatchTemplate;
  declaration: TryCatchDeclaration;
}
