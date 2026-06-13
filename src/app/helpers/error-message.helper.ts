import { l10n, window } from 'vscode';

export const showNoWorkspaceFolderError = (extensionDisplayName: string) => {
  window.showErrorMessage(
    l10n.t(
      '{0}: No workspace folders are open. Please open a workspace folder to use this extension',
      extensionDisplayName,
    ),
  );
};

export default {};
