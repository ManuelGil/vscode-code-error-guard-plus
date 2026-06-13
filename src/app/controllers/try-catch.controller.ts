import {
  Position,
  Range,
  Selection,
  TextDocument,
  TextEditor,
  l10n,
  window,
} from 'vscode';

import {
  DEFAULT_CATCH_BLOCK_CONTENT,
  DEFAULT_CATCH_FOLLOW_UP_STATEMENT,
  DEFAULT_ERROR_VARIABLE,
  ExtensionConfig,
} from '../configs';
import { TryCatchService } from '../services';

type SelectionKind = 'EMPTY' | 'FULL_LINE' | 'PARTIAL';

type InsertionEdit =
  | {
      kind: 'replace';
      range: Range;
      snippet: string;
      order: number;
      index: number;
    }
  | {
      kind: 'insert';
      position: Position;
      snippet: string;
      appendNewline: boolean;
      order: number;
      index: number;
    };

type RemovalEdit = {
  range: Range;
  payload: string;
  order: number;
  index: number;
};

export class TryCatchController {
  constructor(
    readonly service: TryCatchService,
    private readonly config: ExtensionConfig,
  ) {}

  async insertTextInActiveEditor(): Promise<void> {
    const editor = window.activeTextEditor;

    if (!editor) {
      window.showErrorMessage(l10n.t('No active editor available!'));
      return;
    }

    try {
      const document = editor.document;
      const selections = [...editor.selections];
      const languageId = document.languageId;
      const indentUnit = this.getIndentUnit(editor);
      const catchVariables = this.resolveCatchVariables(languageId);
      const edits: InsertionEdit[] = [];
      let hasWarnedAlreadyWrapped = false;

      for (const [index, selection] of selections.entries()) {
        const activeLine = document.lineAt(selection.active.line);
        const effectiveSelection = this.resolveEffectiveSelection(
          document,
          selection,
        );
        const selectionKind = this.classifySelection(
          document,
          effectiveSelection,
        );
        if (selection.isEmpty && activeLine.text.trim().length === 0) {
          continue;
        }
        const lineIndent = this.getLineIndent(
          document,
          effectiveSelection.start.line,
        );
        const selectedText =
          selectionKind === 'FULL_LINE'
            ? document.getText(effectiveSelection)
            : '';

        if (
          selectionKind === 'FULL_LINE' &&
          this.service.isAlreadyWrapped(selectedText, languageId)
        ) {
          if (!hasWarnedAlreadyWrapped) {
            window.showWarningMessage(
              l10n.t('Selected text already contains a try/catch structure.'),
            );
            hasWarnedAlreadyWrapped = true;
          }
          continue;
        }

        const selectedCode =
          selectionKind === 'FULL_LINE'
            ? this.indentSelectedCode(selectedText, lineIndent, indentUnit)
            : languageId === 'python'
              ? `${lineIndent}${indentUnit}pass`
              : '';

        const snippet = await this.service.generateTryCatchSnippet(languageId, {
          indent: lineIndent,
          indentUnit,
          errorVar: catchVariables.errorVar,
          catchContent: catchVariables.catchContent,
          followUpStatement: catchVariables.followUpStatement,
          selectedCode,
        });

        if (selectionKind === 'FULL_LINE') {
          edits.push({
            kind: 'replace',
            range: selection.isEmpty ? activeLine.range : effectiveSelection,
            snippet,
            order: document.offsetAt(effectiveSelection.start),
            index,
          });
          continue;
        }

        const insertionPosition =
          selectionKind === 'EMPTY'
            ? new Position(effectiveSelection.active.line, 0)
            : effectiveSelection.active;

        edits.push({
          kind: 'insert',
          position: insertionPosition,
          snippet,
          appendNewline: true,
          order: document.offsetAt(insertionPosition),
          index,
        });
      }

      if (!edits.length) {
        return;
      }

      const orderedEdits = edits.sort((a, b) => {
        if (a.order === b.order) {
          return b.index - a.index;
        }
        return b.order - a.order;
      });

      await editor.edit((editBuilder) => {
        for (const edit of orderedEdits) {
          if (edit.kind === 'replace') {
            editBuilder.replace(edit.range, edit.snippet);
            continue;
          }

          const content = edit.appendNewline
            ? `${edit.snippet}\n`
            : edit.snippet;
          editBuilder.insert(edit.position, content);
        }
      });

      editor.selections = editor.selections.map((selection) => {
        return new Selection(selection.active, selection.active);
      });
    } catch (error) {
      console.error(error);
      window.showErrorMessage(
        l10n.t(
          'Failed to insert try/catch block. {0}',
          error instanceof Error ? error.message : String(error),
        ),
      );
    }
  }

  async removeGeneratedTryCatchInFile(): Promise<void> {
    const editor = window.activeTextEditor;

    if (!editor) {
      window.showErrorMessage(l10n.t('No active editor available!'));
      return;
    }

    const document = editor.document;
    const languageId = document.languageId;
    const indentUnit = this.getIndentUnit(editor);
    const detectionRegex = this.service.getStructureDetectionRegex(languageId);

    if (!detectionRegex) {
      window.showWarningMessage(
        l10n.t(
          'This language is not supported for generated try/catch removal.',
        ),
      );
      return;
    }

    const documentText = document.getText();
    detectionRegex.lastIndex = 0;
    const removals: RemovalEdit[] = [];
    let hadMismatchStructure = false;
    let match: RegExpExecArray | null;
    let matchIndex = 0;

    while ((match = detectionRegex.exec(documentText)) !== null) {
      const start = match.index;
      const end = start + match[0].length;
      const rangeStart = document.positionAt(start);
      const rangeEnd = document.positionAt(end);
      const range = new Range(rangeStart, rangeEnd);
      const snippet = document.getText(range);
      const indent = this.getLineIndent(document, range.start.line);
      const removalIndent = `${indent}${indentUnit}`;
      const extraction = this.service.extractGeneratedPayload(
        languageId,
        snippet,
        removalIndent,
      );

      if (!extraction) {
        hadMismatchStructure = true;
      } else {
        removals.push({
          range,
          payload: this.unindentPayload(extraction.payload, indent, indentUnit),
          order: start,
          index: matchIndex,
        });
      }

      matchIndex += 1;

      if (match.index === detectionRegex.lastIndex) {
        detectionRegex.lastIndex += 1;
      }
    }

    if (!removals.length) {
      if (hadMismatchStructure) {
        window.showWarningMessage(
          l10n.t(
            'Detected try/catch blocks do not match generated structures and were left untouched.',
          ),
        );
        return;
      }

      window.showInformationMessage(
        l10n.t('No generated try/catch structures detected in this file.'),
      );
      return;
    }

    const orderedRemovals = removals.sort((a, b) => {
      if (a.order === b.order) {
        return b.index - a.index;
      }
      return b.order - a.order;
    });

    await editor.edit((editBuilder) => {
      for (const removal of orderedRemovals) {
        editBuilder.replace(removal.range, removal.payload);
      }
    });

    editor.selections = editor.selections.map((selection) => {
      return new Selection(selection.active, selection.active);
    });

    if (hadMismatchStructure) {
      window.showWarningMessage(
        l10n.t(
          'Some try/catch blocks were skipped because they no longer match generated structures.',
        ),
      );
    }
  }

  async removeGeneratedTryCatch(): Promise<void> {
    const editor = window.activeTextEditor;

    if (!editor) {
      window.showErrorMessage(l10n.t('No active editor available!'));
      return;
    }

    const document = editor.document;
    const selections = [...editor.selections];
    const languageId = document.languageId;
    const indentUnit = this.getIndentUnit(editor);
    const removals: RemovalEdit[] = [];
    let hadMissingStructure = false;
    let hadMismatchStructure = false;

    try {
      for (const [index, selection] of selections.entries()) {
        const selectionKind = this.classifySelection(document, selection);

        if (selectionKind === 'PARTIAL') {
          continue;
        }

        const targetRange =
          selectionKind === 'FULL_LINE'
            ? selection
            : this.findGeneratedStructureRange(
                document,
                selection.active,
                languageId,
              );

        if (!targetRange) {
          hadMissingStructure = true;
          continue;
        }

        const indent = this.getLineIndent(document, targetRange.start.line);
        const removalIndent = `${indent}${indentUnit}`;
        const snippet = document.getText(targetRange);
        const extraction = this.service.extractGeneratedPayload(
          languageId,
          snippet,
          removalIndent,
        );

        if (!extraction) {
          hadMismatchStructure = true;
          continue;
        }

        removals.push({
          range: targetRange,
          payload: this.unindentPayload(extraction.payload, indent, indentUnit),
          order: document.offsetAt(targetRange.start),
          index,
        });
      }

      if (!removals.length) {
        if (hadMissingStructure) {
          window.showWarningMessage(
            l10n.t('No generated try/catch structure detected for removal.'),
          );
          return;
        }

        if (hadMismatchStructure) {
          window.showWarningMessage(
            l10n.t(
              'The selection does not match a generated try/catch structure.',
            ),
          );
        }

        return;
      }

      const orderedRemovals = removals.sort((a, b) => {
        if (a.order === b.order) {
          return b.index - a.index;
        }
        return b.order - a.order;
      });

      await editor.edit((editBuilder) => {
        for (const removal of orderedRemovals) {
          editBuilder.replace(removal.range, removal.payload);
        }
      });

      editor.selections = editor.selections.map((selection) => {
        return new Selection(selection.active, selection.active);
      });

      if (!hadMissingStructure && !hadMismatchStructure) {
        return;
      }

      if (hadMissingStructure) {
        window.showWarningMessage(
          l10n.t('No generated try/catch structure detected for removal.'),
        );
      }

      if (hadMismatchStructure) {
        window.showWarningMessage(
          l10n.t(
            'The selection does not match a generated try/catch structure.',
          ),
        );
      }
    } catch (error) {
      console.error(error);
      window.showErrorMessage(
        l10n.t(
          'Failed to remove try/catch blocks. {0}',
          error instanceof Error ? error.message : String(error),
        ),
      );
    }
  }

  private resolveEffectiveSelection(
    document: TextDocument,
    selection: Selection,
  ): Selection {
    if (!selection.isEmpty) {
      return selection;
    }

    const activeLine = document.lineAt(selection.active.line);

    if (activeLine.text.trim().length === 0) {
      return selection;
    }

    return new Selection(activeLine.range.start, activeLine.range.end);
  }

  private resolveCatchVariables(languageId: string): {
    errorVar: string;
    catchContent: string;
    followUpStatement: string;
  } {
    let errorVar = this.config.errorVariableName;
    let catchContent = this.config.catchBlockContent;
    let followUpStatement = this.config.catchFollowUpStatement;

    const usesDefaults =
      errorVar === DEFAULT_ERROR_VARIABLE &&
      catchContent === DEFAULT_CATCH_BLOCK_CONTENT &&
      followUpStatement === DEFAULT_CATCH_FOLLOW_UP_STATEMENT;

    if (!usesDefaults) {
      return { errorVar, catchContent, followUpStatement };
    }

    switch (languageId) {
      case 'java':
      case 'csharp':
        errorVar = 'ex';
        catchContent = '// TODO: handle exception';
        followUpStatement = 'ex.printStackTrace();';
        break;
      case 'python':
        errorVar = 'e';
        catchContent = '# TODO: handle exception';
        followUpStatement = 'print(e)';
        break;
      case 'php':
        errorVar = 'e';
        catchContent = '// TODO: handle exception';
        followUpStatement = 'error_log($e);';
        break;
      case 'ruby':
        errorVar = 'e';
        catchContent = '# TODO: handle exception';
        followUpStatement = 'puts e.message';
        break;
      case 'cpp':
        errorVar = 'ex';
        catchContent = '// TODO: handle exception';
        followUpStatement = 'std::cerr << ex.what() << std::endl;';
        break;
      case 'go':
        errorVar = 'err';
        catchContent = '// TODO: handle recover';
        followUpStatement = 'fmt.Println(err)';
        break;
      default:
        break;
    }

    return { errorVar, catchContent, followUpStatement };
  }

  private getIndentUnit(editor: TextEditor): string {
    if (editor.options.insertSpaces === false) {
      return '\t';
    }

    const tabSizeSetting = editor.options.tabSize;
    const tabSize =
      typeof tabSizeSetting === 'number' && tabSizeSetting > 0
        ? tabSizeSetting
        : 2;

    return ' '.repeat(tabSize);
  }

  private getLineIndent(document: TextDocument, lineNumber: number): string {
    const lineText = document.lineAt(lineNumber).text;
    return lineText.match(/^(\s*)/)?.[1] ?? '';
  }

  private classifySelection(
    document: TextDocument,
    selection: Selection,
  ): SelectionKind {
    if (selection.isEmpty) {
      return 'EMPTY';
    }

    if (this.isFullLineSelection(document, selection)) {
      return 'FULL_LINE';
    }

    return 'PARTIAL';
  }

  private isFullLineSelection(
    document: TextDocument,
    selection: Selection,
  ): boolean {
    if (selection.isEmpty) {
      return false;
    }

    if (selection.start.character !== 0) {
      return false;
    }

    const endsAtLineStart = selection.end.character === 0;
    const isEndLineWithinDocument = selection.end.line < document.lineCount;
    const endsAtLineEnd =
      isEndLineWithinDocument &&
      selection.end.character ===
        document.lineAt(selection.end.line).text.length;

    if (!endsAtLineStart && !endsAtLineEnd) {
      return false;
    }

    if (endsAtLineStart) {
      return selection.end.line > selection.start.line;
    }

    return true;
  }

  private indentSelectedCode(
    code: string,
    lineIndent: string,
    indentUnit: string,
  ): string {
    if (!code.length) {
      return code;
    }

    const usesCarriageReturn = code.includes('\r\n');
    const lineBreak = usesCarriageReturn ? '\r\n' : '\n';
    const endsWithLineBreak =
      code.endsWith('\r\n') || (!usesCarriageReturn && code.endsWith('\n'));

    const lines = code.split(/\r?\n/);
    const trimmedLines = endsWithLineBreak ? lines.slice(0, -1) : lines;

    const adjustedLines = trimmedLines.map((line) => {
      const shouldTrimBaseIndent =
        lineIndent.length > 0 && line.startsWith(lineIndent);
      const remainder = shouldTrimBaseIndent
        ? line.slice(lineIndent.length)
        : line;
      return `${lineIndent}${indentUnit}${remainder}`;
    });

    let result = adjustedLines.join(lineBreak);
    if (endsWithLineBreak) {
      result += lineBreak;
    }

    return result;
  }

  private unindentPayload(
    payload: string,
    lineIndent: string,
    indentUnit: string,
  ): string {
    if (!payload.length) {
      return payload;
    }

    const usesCarriageReturn = payload.includes('\r\n');
    const lineBreak = usesCarriageReturn ? '\r\n' : '\n';
    const endsWithLineBreak =
      payload.endsWith('\r\n') ||
      (!usesCarriageReturn && payload.endsWith('\n'));

    const lines = payload.split(/\r?\n/);
    const trimmedLines = endsWithLineBreak ? lines.slice(0, -1) : lines;
    const removalIndent = `${lineIndent}${indentUnit}`;

    const adjustedLines = trimmedLines.map((line) => {
      if (line.startsWith(removalIndent)) {
        return `${lineIndent}${line.slice(removalIndent.length)}`;
      }

      return line;
    });

    let result = adjustedLines.join(lineBreak);
    if (endsWithLineBreak) {
      result += lineBreak;
    }

    return result;
  }

  private findGeneratedStructureRange(
    document: TextDocument,
    anchor: Position,
    languageId: string,
  ): Range | null {
    const detectionRegex = this.service.getStructureDetectionRegex(languageId);

    if (!detectionRegex) {
      return null;
    }

    const documentText = document.getText();
    const anchorOffset = document.offsetAt(anchor);

    detectionRegex.lastIndex = 0;
    let match: RegExpExecArray | null = null;

    while ((match = detectionRegex.exec(documentText)) !== null) {
      const start = match.index;
      const end = start + match[0].length;

      if (start <= anchorOffset && anchorOffset <= end) {
        const matchStart = document.positionAt(start);
        const rangeEnd = document.positionAt(end);

        const lineStart = document.lineAt(matchStart.line).range.start;

        return new Range(lineStart, rangeEnd);
      }

      if (match.index === detectionRegex.lastIndex) {
        detectionRegex.lastIndex += 1;
      }
    }

    return null;
  }
}
