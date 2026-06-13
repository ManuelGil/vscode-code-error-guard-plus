import { TryCatchLanguageProfile } from '../types';

export const LANGUAGE_PROFILES: TryCatchLanguageProfile[] = [
  {
    language: 'javascript',
    template: {
      language: 'javascript',
      tryBlock: ['{{indent}}try {'],
      catchBlock: [
        '{{indent}}} catch ({{{errorVar}}}) {',
        '{{indent}}{{indentUnit}}{{{catchContent}}}',
        '{{indent}}{{indentUnit}}{{{followUpStatement}}}',
        '{{indent}}}',
      ],
    },
    declaration: {
      language: 'javascript',
      tryDeclaration: 'try\\s*\\{',
      catchDeclaration: '\\}\\s*catch\\s*\\(([^)]+)\\)\\s*\\{',
      closing: '\\}',
    },
  },
  {
    language: 'typescript',
    template: {
      language: 'typescript',
      tryBlock: ['{{indent}}try {'],
      catchBlock: [
        '{{indent}}} catch ({{{errorVar}}}) {',
        '{{indent}}{{indentUnit}}{{{catchContent}}}',
        '{{indent}}{{indentUnit}}{{{followUpStatement}}}',
        '{{indent}}}',
      ],
    },
    declaration: {
      language: 'typescript',
      tryDeclaration: 'try\\s*\\{',
      catchDeclaration: '\\}\\s*catch\\s*\\(([^)]+)\\)\\s*\\{',
      closing: '\\}',
    },
  },
  {
    language: 'java',
    template: {
      language: 'java',
      tryBlock: ['{{indent}}try {'],
      catchBlock: [
        '{{indent}}} catch (Exception {{{errorVar}}}) {',
        '{{indent}}{{indentUnit}}{{{catchContent}}}',
        '{{indent}}{{indentUnit}}{{{followUpStatement}}}',
        '{{indent}}}',
      ],
    },
    declaration: {
      language: 'java',
      tryDeclaration: 'try\\s*\\{',
      catchDeclaration: '\\}\\s*catch\\s*\\(Exception\\s+([^\\)]+)\\)\\s*\\{',
      closing: '\\}',
    },
  },
  {
    language: 'csharp',
    template: {
      language: 'csharp',
      tryBlock: ['{{indent}}try {'],
      catchBlock: [
        '{{indent}}} catch (Exception {{{errorVar}}}) {',
        '{{indent}}{{indentUnit}}{{{catchContent}}}',
        '{{indent}}{{indentUnit}}{{{followUpStatement}}}',
        '{{indent}}}',
      ],
    },
    declaration: {
      language: 'csharp',
      tryDeclaration: 'try\\s*\\{',
      catchDeclaration: '\\}\\s*catch\\s*\\(Exception\\s+([^\\)]+)\\)\\s*\\{',
      closing: '\\}',
    },
  },
  {
    language: 'php',
    template: {
      language: 'php',
      tryBlock: ['{{indent}}try {'],
      catchBlock: [
        '{{indent}}} catch (Exception ${{{errorVar}}}) {',
        '{{indent}}{{indentUnit}}{{{catchContent}}}',
        '{{indent}}{{indentUnit}}{{{followUpStatement}}}',
        '{{indent}}}',
      ],
    },
    declaration: {
      language: 'php',
      tryDeclaration: 'try\\s*\\{',
      catchDeclaration:
        '\\}\\s*catch\\s*\\(Exception\\s+\\$([^\\)]+)\\)\\s*\\{',
      closing: '\\}',
    },
  },
  {
    language: 'dart',
    template: {
      language: 'dart',
      tryBlock: ['{{indent}}try {'],
      catchBlock: [
        '{{indent}}} catch (e) {',
        '{{indent}}{{indentUnit}}{{{catchContent}}}',
        '{{indent}}{{indentUnit}}{{{followUpStatement}}}',
        '{{indent}}}',
      ],
    },
    declaration: {
      language: 'dart',
      tryDeclaration: 'try\\s*\\{',
      catchDeclaration: '\\}\\s*catch\\s*\\(e\\)\\s*\\{',
      closing: '\\}',
    },
  },
  {
    language: 'python',
    template: {
      language: 'python',
      tryBlock: ['{{indent}}try:'],
      catchBlock: [
        '{{indent}}except Exception as {{{errorVar}}}:',
        '{{indent}}{{indentUnit}}{{{catchContent}}}',
        '{{indent}}{{indentUnit}}{{{followUpStatement}}}',
      ],
    },
    declaration: {
      language: 'python',
      tryDeclaration: '[ \\t]*try:\\s*\\n',
      catchDeclaration:
        '(?<indent>[ \\t]*)except\\s+Exception\\s+as\\s+([a-zA-Z_][a-zA-Z0-9_]*)\\s*:\\s*\\n',
      closing: '(?=\\n(?:\\s*\\n)*\\k<indent>(?![ \\t])|\\n\\s*$|$)',
    },
  },
  {
    language: 'cpp',
    template: {
      language: 'cpp',
      tryBlock: ['{{indent}}try {'],
      catchBlock: [
        '{{indent}}} catch (const std::exception& {{{errorVar}}}) {',
        '{{indent}}{{indentUnit}}{{{catchContent}}}',
        '{{indent}}{{indentUnit}}{{{followUpStatement}}}',
        '{{indent}}}',
      ],
    },
    declaration: {
      language: 'cpp',
      tryDeclaration: 'try\\s*\\{',
      catchDeclaration:
        '\\}\\s*catch\\s*\\(const\\s+std::exception&\\s+([^\\)]+)\\)\\s*\\{',
      closing: '\\}',
    },
  },
  {
    language: 'ruby',
    template: {
      language: 'ruby',
      tryBlock: ['{{indent}}begin'],
      catchBlock: [
        '{{indent}}rescue => {{{errorVar}}}',
        '{{indent}}{{indentUnit}}{{{catchContent}}}',
        '{{indent}}{{indentUnit}}{{{followUpStatement}}}',
        '{{indent}}end',
      ],
    },
    declaration: {
      language: 'ruby',
      tryDeclaration: 'begin\\s*\\n',
      catchDeclaration: 'rescue\\s+=>\\s+([a-zA-Z_][a-zA-Z0-9_]*)\\s*\\n',
      closing: 'end',
    },
  },
  {
    language: 'go',
    template: {
      language: 'go',
      tryBlock: [
        '{{indent}}// Emulate try/catch in Go using panic/recover',
        '{{indent}}defer func() {',
        '{{indent}}{{indentUnit}}if err := recover(); err != nil {',
      ],
      catchBlock: [
        '{{indent}}{{indentUnit}}{{indentUnit}}{{{catchContent}}}',
        '{{indent}}{{indentUnit}}{{indentUnit}}{{{followUpStatement}}}',
        '{{indent}}{{indentUnit}}}',
        '{{indent}}}()',
      ],
    },
    declaration: {
      language: 'go',
      tryDeclaration:
        'defer\\s+func\\s*\\(\\)\\s*\\{\\s*if\\s+err\\s*:=\\s*recover\\(\\)\\s*;\\s*err\\s*!=\\s*nil\\s*\\{',
      catchDeclaration: '\\}',
      closing: '\\}\\(\\)',
    },
  },
];
