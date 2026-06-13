import {
  Disposable,
  ExtensionContext,
  MessageItem,
  Uri,
  WorkspaceFolder,
  commands,
  env,
  l10n,
  window,
  workspace,
} from 'vscode';
import VSCodeMarketplaceClient from 'vscode-marketplace-client';

// Import the Configs and Controllers
import {
  CommandIds,
  ContextKeys,
  EXTENSION_DISPLAY_NAME,
  EXTENSION_ID,
  EXTENSION_NAME,
  EXTENSION_REPOSITORY_URL,
  ExtensionConfig,
  USER_PUBLISHER,
  ViewIds,
} from './app/configs';
import { ListTryCatchController, TryCatchController } from './app/controllers';
import { ListTryCatchProvider } from './app/providers';
import { TryCatchService } from './app/services';

export class ExtensionRuntime {
  /**
   * Avoids repeated disabled-state notifications across command invocations.
   */
  private hasDisabledWarningBeenShown = false;

  /**
   * Current workspace-scoped extension configuration.
   */
  private config!: ExtensionConfig;

  private tryCatchService: TryCatchService | undefined;
  private tryCatchController: TryCatchController | undefined;

  constructor(public readonly context: ExtensionContext) {}

  async initialize(): Promise<boolean> {
    if (!workspace.workspaceFolders?.length) {
      window.showErrorMessage(
        l10n.t(
          '{0}: No workspace folders are open. Please open a workspace folder to use this extension',
          EXTENSION_DISPLAY_NAME,
        ),
      );
      return false;
    }

    const selectedWorkspaceFolder = await this.selectWorkspaceFolder();

    if (!selectedWorkspaceFolder) {
      return false;
    }

    this.initializeConfiguration(selectedWorkspaceFolder);

    if (!this.isExtensionEnabled()) {
      return false;
    }

    this.startVersionChecks();

    this.initializeCoreServices();

    return true;
  }

  async start(): Promise<void> {
    this.registerWorkspaceCommands();
    this.registerCommands();
    this.registerListTryCatchCommands();
    this.registerListTryCatchEvents();
  }

  /**
   * Runs non-blocking version checks after startup.
   */
  private startVersionChecks(): void {
    void this.handleLocalVersionNotifications();
    void this.checkMarketplaceVersion();
  }

  /**
   * Returns the extension version declared in package metadata.
   */
  private getCurrentVersion(): string {
    return this.context.extension.packageJSON?.version ?? '0.0.0';
  }

  /**
   * Handles first-run and local update notifications.
   */
  private async handleLocalVersionNotifications(): Promise<void> {
    const previousVersion = this.context.globalState.get<string>(
      ContextKeys.Version,
    );

    const currentVersion = this.getCurrentVersion();

    if (!previousVersion) {
      const welcomeMessage = l10n.t(
        'Welcome to {0} version {1}! The extension is now active',
        EXTENSION_DISPLAY_NAME,
        currentVersion,
      );

      window.showInformationMessage(welcomeMessage);

      await this.context.globalState.update(
        ContextKeys.Version,
        currentVersion,
      );

      return;
    }

    if (previousVersion !== currentVersion) {
      const actionReleaseNotes: MessageItem = {
        title: l10n.t('Release Notes'),
      };
      const actionDismiss: MessageItem = { title: l10n.t('Dismiss') };
      const availableActions = [actionReleaseNotes, actionDismiss];

      const updateMessage = l10n.t(
        "The {0} extension has been updated. Check out what's new in version {1}",
        EXTENSION_DISPLAY_NAME,
        currentVersion,
      );

      const userSelection = await window.showInformationMessage(
        updateMessage,
        ...availableActions,
      );

      if (userSelection?.title === actionReleaseNotes.title) {
        const changelogUrl = `${EXTENSION_REPOSITORY_URL}/blob/main/CHANGELOG.md`;
        env.openExternal(Uri.parse(changelogUrl));
      }

      await this.context.globalState.update(
        ContextKeys.Version,
        currentVersion,
      );
    }
  }

  /**
   * Checks Marketplace for a newer published extension version.
   */
  private async checkMarketplaceVersion(): Promise<void> {
    const currentVersion = this.getCurrentVersion();

    try {
      const latestVersion = await VSCodeMarketplaceClient.getLatestVersion(
        USER_PUBLISHER,
        EXTENSION_NAME,
      );

      if (latestVersion === currentVersion) {
        return;
      }

      const actionUpdateNow: MessageItem = { title: l10n.t('Update Now') };
      const actionDismiss: MessageItem = { title: l10n.t('Dismiss') };
      const availableActions = [actionUpdateNow, actionDismiss];

      const updateMessage = l10n.t(
        'A new version of {0} is available. Update to version {1} now',
        EXTENSION_DISPLAY_NAME,
        latestVersion,
      );

      const userSelection = await window.showInformationMessage(
        updateMessage,
        ...availableActions,
      );

      if (userSelection?.title === actionUpdateNow.title) {
        await commands.executeCommand(
          'workbench.extensions.action.install.anotherVersion',
          `${USER_PUBLISHER}.${EXTENSION_NAME}`,
        );
      }
    } catch (error) {
      console.error('Error retrieving extension version:', error);
    }
  }

  /**
   * Selects the workspace folder to use for the extension.
   * VSCode does not guarantee a workspace folder exists during activation,
   * so this method explicitly handles missing workspace scenarios.
   */
  private async selectWorkspaceFolder(): Promise<WorkspaceFolder | undefined> {
    const workspaceFolders = workspace.workspaceFolders;

    // Check if there are workspace folders
    if (!workspaceFolders || workspaceFolders.length === 0) {
      const message = l10n.t(
        '{0}: No workspace folders are open. Please open a workspace folder to use this extension',
        EXTENSION_DISPLAY_NAME,
      );
      window.showErrorMessage(message);

      return undefined;
    }

    // Try to load previously selected workspace folder from global state
    const previousFolderUri = this.context.globalState.get<string>(
      ContextKeys.SelectedWorkspaceFolder,
    );
    let previousFolder: WorkspaceFolder | undefined;

    // Find the workspace folder by URI
    if (previousFolderUri) {
      previousFolder = workspaceFolders.find(
        (folder) => folder.uri.toString() === previousFolderUri,
      );
    }

    // Determine the workspace folder to use
    // Only one workspace folder available
    if (workspaceFolders.length === 1) {
      return workspaceFolders[0];
    }

    // Use previously selected workspace folder if available
    if (previousFolder) {
      // Notify the user which workspace is being used
      window.showInformationMessage(
        l10n.t('Using workspace folder: {0}', previousFolder.name),
      );

      return previousFolder;
    }

    // Multiple workspace folders and no previous selection
    const placeHolder = l10n.t(
      '{0}: Select a workspace folder to use. This folder will be used to load workspace-specific configuration for the extension',
      EXTENSION_DISPLAY_NAME,
    );
    const selectedFolder = await window.showWorkspaceFolderPick({
      placeHolder,
    });

    // Remember the selection for future use
    if (selectedFolder) {
      this.context.globalState.update(
        ContextKeys.SelectedWorkspaceFolder,
        selectedFolder.uri.toString(),
      );
    }

    return selectedFolder;
  }

  /**
   * Initializes workspace configuration and registers configuration listeners.
   *
   * @param selectedWorkspaceFolder - The workspace folder used to load the configuration.
   */
  private initializeConfiguration(
    selectedWorkspaceFolder: WorkspaceFolder,
  ): void {
    this.config = new ExtensionConfig(
      workspace.getConfiguration(EXTENSION_ID, selectedWorkspaceFolder.uri),
    );

    this.config.workspaceSelection = selectedWorkspaceFolder.uri.fsPath;

    workspace.onDidChangeConfiguration((configurationChangeEvent) => {
      const updatedWorkspaceConfig = workspace.getConfiguration(
        EXTENSION_ID,
        selectedWorkspaceFolder.uri,
      );

      if (
        configurationChangeEvent.affectsConfiguration(
          `${EXTENSION_ID}.enable`,
          selectedWorkspaceFolder.uri,
        )
      ) {
        const isExtensionEnabled =
          updatedWorkspaceConfig.get<boolean>('enable');

        this.config.update(updatedWorkspaceConfig);

        if (isExtensionEnabled) {
          const enabledMessage = l10n.t(
            'The {0} extension is now enabled and ready to use',
            EXTENSION_DISPLAY_NAME,
          );
          window.showInformationMessage(enabledMessage);
        } else {
          const disabledMessage = l10n.t(
            'The {0} extension is now disabled',
            EXTENSION_DISPLAY_NAME,
          );
          window.showInformationMessage(disabledMessage);
        }
      }

      if (
        configurationChangeEvent.affectsConfiguration(
          EXTENSION_ID,
          selectedWorkspaceFolder.uri,
        )
      ) {
        this.config.update(updatedWorkspaceConfig);
      }
    });
  }

  /**
   * Returns whether commands should execute under current configuration.
   *
   * @remarks
   * Shows a disabled warning once until the extension is re-enabled.
   */
  private isExtensionEnabled(): boolean {
    const isEnabled = this.config.enable;

    if (isEnabled) {
      this.hasDisabledWarningBeenShown = false;
      return true;
    }

    if (!this.hasDisabledWarningBeenShown) {
      window.showErrorMessage(
        l10n.t(
          'The {0} extension is disabled in settings. Enable it to use its features',
          EXTENSION_DISPLAY_NAME,
        ),
      );
      this.hasDisabledWarningBeenShown = true;
    }

    return false;
  }

  /**
   * Registers workspace selection command for multi-root workspaces.
   */
  private registerWorkspaceCommands(): void {
    const disposable = commands.registerCommand(
      `${EXTENSION_ID}.${CommandIds.ChangeWorkspace}`,
      async () => {
        const selectedFolder = await window.showWorkspaceFolderPick({
          placeHolder: l10n.t('Select a workspace folder to use'),
        });

        if (!selectedFolder) {
          return;
        }

        await this.context.globalState.update(
          ContextKeys.SelectedWorkspaceFolder,
          selectedFolder.uri.toString(),
        );

        const updatedConfiguration = workspace.getConfiguration(
          EXTENSION_ID,
          selectedFolder.uri,
        );

        this.config.update(updatedConfiguration);

        this.config.workspaceSelection = selectedFolder.uri.fsPath;

        window.showInformationMessage(
          l10n.t('Switched to workspace folder: {0}', selectedFolder.name),
        );
      },
    );

    this.context.subscriptions.push(disposable);
  }

  private initializeCoreServices(): void {
    this.tryCatchService = new TryCatchService(this.config);
    this.tryCatchController = new TryCatchController(
      this.tryCatchService,
      this.config,
    );
  }

  private registerCommands(): void {
    const registerWorkflowCommand = (
      commandId: CommandIds,
      handler: (controller: TryCatchController) => void,
    ): Disposable => {
      return commands.registerCommand(`${EXTENSION_ID}.${commandId}`, () => {
        if (!this.config?.enable) {
          const message = l10n.t(
            '{0} is disabled in settings. Enable it to use its features',
            EXTENSION_DISPLAY_NAME,
          );
          window.showWarningMessage(message);
          return;
        }

        if (!this.tryCatchController) {
          window.showErrorMessage(
            l10n.t('Try/catch workflows are not ready yet. Please try again.'),
          );
          return;
        }

        handler(this.tryCatchController);
      });
    };

    const disposables: Disposable[] = [
      registerWorkflowCommand(CommandIds.InsertTryCatch, (controller) => {
        controller.insertTextInActiveEditor();
      }),
      registerWorkflowCommand(
        CommandIds.RemoveGeneratedTryCatch,
        (controller) => {
          controller.removeGeneratedTryCatch();
        },
      ),
      registerWorkflowCommand(
        CommandIds.RemoveGeneratedTryCatchFile,
        (controller) => {
          controller.removeGeneratedTryCatchInFile();
        },
      ),
    ];

    this.context.subscriptions.push(...disposables);
  }

  private registerListTryCatchCommands(): void {
    if (!this.config) {
      return;
    }

    const tryCatchService = new TryCatchService(this.config);
    const listTryCatchController = new ListTryCatchController(this.config);
    const listTryCatchProvider = new ListTryCatchProvider(
      listTryCatchController,
      tryCatchService,
    );

    const listTryCatchTreeView = window.createTreeView(
      `${EXTENSION_ID}.${ViewIds.ListTryCatchView}`,
      {
        treeDataProvider: listTryCatchProvider,
        showCollapseAll: true,
      },
    );

    const ListTryCatchCommands: Array<{
      id: CommandIds;
      handler: (...args: any[]) => void;
    }> = [
      {
        id: CommandIds.ListTryCatchViewRefreshList,
        handler: () => listTryCatchProvider.refresh(),
      },
      {
        id: CommandIds.ListTryCatchViewOpenFile,
        handler: (uri: Uri) => listTryCatchController.openFile(uri),
      },
      {
        id: CommandIds.ListTryCatchViewGotoLine,
        handler: (uri: Uri, line: number) =>
          listTryCatchController.gotoLine(uri, line),
      },
      {
        id: CommandIds.ListTryCatchViewRevealFile,
        handler: (uri: Uri) => listTryCatchController.revealFile(uri),
      },
      {
        id: CommandIds.ListTryCatchViewCopyPath,
        handler: (uri: Uri) => listTryCatchController.copyPath(uri),
      },
      {
        id: CommandIds.ListTryCatchViewOpenContainingFolder,
        handler: (uri: Uri) => listTryCatchController.openContainingFolder(uri),
      },
      {
        id: CommandIds.ListTryCatchViewGotoLineFromNode,
        handler: (uri: Uri) => listTryCatchController.gotoLineFromNode(uri),
      },
      {
        id: CommandIds.ListTryCatchViewCopyGeneratedStructureText,
        handler: (uri: Uri) =>
          listTryCatchController.copyGeneratedStructureText(uri),
      },
    ];

    ListTryCatchCommands.forEach(({ id, handler }) => {
      const disposable = commands.registerCommand(
        `${EXTENSION_ID}.${id}`,
        (...args: any[]) => {
          if (!this.isExtensionEnabled()) {
            return;
          }

          handler(...args);
        },
      );

      this.context.subscriptions.push(disposable);
    });

    this.context.subscriptions.push(listTryCatchTreeView, listTryCatchProvider);
  }

  private registerListTryCatchEvents(): void {
    if (!this.config) {
      return;
    }

    const tryCatchService = new TryCatchService(this.config);
    const listTryCatchController = new ListTryCatchController(this.config);
    const listTryCatchProvider = new ListTryCatchProvider(
      listTryCatchController,
      tryCatchService,
    );

    let refreshTimeout: ReturnType<typeof setTimeout> | undefined;

    const scheduleRefresh = () => {
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }
      refreshTimeout = setTimeout(() => {
        listTryCatchProvider.refresh();
      }, 250);
    };

    const onSaveDisposable = workspace.onDidSaveTextDocument(() => {
      scheduleRefresh();
    });

    const refreshTimerDisposable = {
      dispose: () => refreshTimeout && clearTimeout(refreshTimeout),
    };

    this.context.subscriptions.push(onSaveDisposable, refreshTimerDisposable);
  }
}
