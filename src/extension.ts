// The module 'vscode' contains the VSCode extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import { ExtensionRuntime } from './extension.runtime';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
  const runtime = new ExtensionRuntime(context);

  try {
    const initialized = await runtime.initialize();
    if (!initialized) {
      return;
    }

    await runtime.start();
  } catch (error) {
    const message = vscode.l10n.t(
      'Failed to activate {0}. Check the logs for more details.',
      context.extension.packageJSON.displayName,
    );
    vscode.window.showErrorMessage(message);
    throw error;
  }
}

// this method is called when your extension is deactivated
export function deactivate() {}
