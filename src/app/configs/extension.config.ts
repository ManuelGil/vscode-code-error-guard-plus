import { WorkspaceConfiguration } from 'vscode';

import { TryCatchTemplate } from '../types';
import {
  DEFAULT_CATCH_BLOCK_CONTENT,
  DEFAULT_CATCH_FOLLOW_UP_STATEMENT,
  DEFAULT_CUSTOM_TRY_CATCH_TEMPLATES,
  DEFAULT_ENABLE_SETTING,
  DEFAULT_ERROR_VARIABLE,
  DEFAULT_EXCLUDE_PATTERNS,
  DEFAULT_INCLUDE_PATTERNS,
  DEFAULT_LANGUAGE_SETTING,
  DEFAULT_MAX_SEARCH_RECURSION_DEPTH,
  DEFAULT_PRESERVE_GITIGNORE_SETTINGS,
  DEFAULT_SHOW_FILE_PATH,
  DEFAULT_SUPPORTS_HIDDEN_FILES,
} from './constants.config';

/**
 * The Config class.
 *
 * @class
 * @classdesc The class that represents the configuration of the extension.
 * @export
 * @public
 * @property {WorkspaceConfiguration} config - The workspace configuration
 * @example
 * const config = new Config(workspace.getConfiguration());
 * console.log(config.includeExtensionOnExport);
 * console.log(config.exclude);
 */
export class ExtensionConfig {
  // -----------------------------------------------------------------
  // Properties
  // -----------------------------------------------------------------

  // Public properties

  /**
   * Enable or disable the extension.
   * @type {boolean}
   * @public
   * @memberof ExtensionConfig
   * @example
   * console.log(config.enable);
   * @default true
   */
  enable: boolean;

  /**
   * Default language applied when the active document cannot be inferred.
   * @type {string}
   * @public
   * @memberof ExtensionConfig
   * @example
   * console.log(config.defaultLanguage);
   * @default "javascript"
   */
  defaultLanguage: string;

  /**
   * Default variable name for error in catch block.
   * @type {string}
   * @public
   * @memberof ExtensionConfig
   * @example
   * console.log(config.errorVariableName);
   * @default "error"
   */
  errorVariableName: string;

  /**
   * Default content for the catch block.
   * @type {string}
   * @public
   * @memberof ExtensionConfig
   * @example
   * console.log(config.catchBlockContent);
   * @default "// TODO: handle error"
   */
  catchBlockContent: string;

  /**
   * Default follow-up statement for the catch block.
   * @type {string}
   * @public
   * @memberof ExtensionConfig
   * @example
   * console.log(config.catchFollowUpStatement);
   * @default "console.error(error);"
   */
  catchFollowUpStatement: string;

  /**
   * Custom templates for try/catch blocks.
   * @type {TryCatchTemplate[]}
   * @public
   * @memberof ExtensionConfig
   * @example
   * console.log(config.customTemplates);
   * @default []
   */
  customTemplates: TryCatchTemplate[];

  /**
   * Glob patterns for files to include in the extension's file operations (e.g., for tree views and search).
   * @example console.log(config.includedFilePatterns);
   */
  includedFilePatterns: string[];

  /**
   * Glob patterns for files to exclude from the extension's file operations.
   */
  excludedFilePatterns: string[];

  /**
   * Maximum recursion depth for file search (0 = unlimited).
   * @example console.log(config.maxSearchRecursionDepth);
   */
  maxSearchRecursionDepth: number;

  /**
   * Whether to include hidden files in search operations.
   * @example console.log(config.supportsHiddenFiles);
   */
  supportsHiddenFiles: boolean;

  /**
   * Whether to respect .gitignore settings during file search.
   * @example console.log(config.preserveGitignoreSettings);
   */
  preserveGitignoreSettings: boolean;

  /**
   * Whether to show the file path in the search results.
   * @example console.log(config.showFilePathInResults);
   */
  showFilePathInResults: boolean;

  /**
   * The selected workspace folder.
   * @type {string | undefined}
   * @public
   * @memberof ExtensionConfig
   * @example
   * const config = new ExtensionConfig(workspace.getConfiguration());
   * console.log(config.workspaceSelection);
   */
  workspaceSelection: string | undefined;

  // -----------------------------------------------------------------
  // Constructor
  // -----------------------------------------------------------------

  /**
   * Constructor for the Config class.
   *
   * @constructor
   * @param {WorkspaceConfiguration} config - The workspace configuration
   * @public
   * @memberof Config
   */
  constructor(readonly config: WorkspaceConfiguration) {
    // Enable or disable the extension.
    this.enable = config.get<boolean>('enable', DEFAULT_ENABLE_SETTING);
    // Default language applied when the active document cannot be inferred.
    this.defaultLanguage = config.get<string>(
      'defaultLanguage',
      DEFAULT_LANGUAGE_SETTING,
    );

    // TryCatch configurations
    this.errorVariableName = config.get<string>(
      'errorVariableName',
      DEFAULT_ERROR_VARIABLE,
    );
    this.catchBlockContent = config.get<string>(
      'catchBlockContent',
      DEFAULT_CATCH_BLOCK_CONTENT,
    );
    this.catchFollowUpStatement = config.get<string>(
      'catchFollowUpStatement',
      DEFAULT_CATCH_FOLLOW_UP_STATEMENT,
    );
    this.customTemplates = config.get<TryCatchTemplate[]>(
      'customTemplates',
      DEFAULT_CUSTOM_TRY_CATCH_TEMPLATES,
    );
    // Glob patterns for files to include in the extension's file operations (e.g., for tree views and search).
    this.includedFilePatterns = config.get<string[]>(
      'files.includedFilePatterns',
      DEFAULT_INCLUDE_PATTERNS,
    );
    // Glob patterns for files to exclude from the extension's file operations.
    this.excludedFilePatterns = config.get<string[]>(
      'files.excludedFilePatterns',
      DEFAULT_EXCLUDE_PATTERNS,
    );
    // Maximum recursion depth for file search (0 = unlimited).
    this.maxSearchRecursionDepth = config.get<number>(
      'files.maxSearchRecursionDepth',
      DEFAULT_MAX_SEARCH_RECURSION_DEPTH,
    );
    // Whether to include hidden files in search operations.
    this.supportsHiddenFiles = config.get<boolean>(
      'files.supportsHiddenFiles',
      DEFAULT_SUPPORTS_HIDDEN_FILES,
    );
    // Whether to respect .gitignore settings during file search.
    this.preserveGitignoreSettings = config.get<boolean>(
      'files.preserveGitignoreSettings',
      DEFAULT_PRESERVE_GITIGNORE_SETTINGS,
    );
    // Whether to show the file path in the search results.
    this.showFilePathInResults = config.get<boolean>(
      'files.includeFilePath',
      DEFAULT_SHOW_FILE_PATH,
    );
  }

  // -----------------------------------------------------------------
  // Methods
  // -----------------------------------------------------------------

  // Public methods
  /**
   * The update method.
   *
   * @function update
   * @param {WorkspaceConfiguration} config - The workspace configuration
   * @public
   * @memberof Config
   * @example
   * const config = new Config(workspace.getConfiguration());
   * config.update(workspace.getConfiguration());
   */
  update(config: WorkspaceConfiguration): void {
    // Enable or disable the extension.
    this.enable = config.get<boolean>('enable', this.enable);
    // Default language applied when the active document cannot be inferred.
    this.defaultLanguage = config.get<string>(
      'defaultLanguage',
      this.defaultLanguage,
    );

    // TryCatch configurations
    this.errorVariableName = config.get<string>(
      'errorVariableName',
      this.errorVariableName,
    );
    this.catchBlockContent = config.get<string>(
      'catchBlockContent',
      this.catchBlockContent,
    );
    this.catchFollowUpStatement = config.get<string>(
      'catchFollowUpStatement',
      this.catchFollowUpStatement,
    );
    this.customTemplates = config.get<TryCatchTemplate[]>(
      'customTemplates',
      this.customTemplates,
    );
    // Glob patterns for files to include in the extension's file operations (e.g., for tree views and search).
    this.includedFilePatterns = config.get<string[]>(
      'files.includedFilePatterns',
      this.includedFilePatterns,
    );
    // Glob patterns for files to exclude from the extension's file operations.
    this.excludedFilePatterns = config.get<string[]>(
      'files.excludedFilePatterns',
      this.excludedFilePatterns,
    );
    // Maximum recursion depth for file search (0 = unlimited).
    this.maxSearchRecursionDepth = config.get<number>(
      'files.maxSearchRecursionDepth',
      this.maxSearchRecursionDepth,
    );
    // Whether to include hidden files in search operations.
    this.supportsHiddenFiles = config.get<boolean>(
      'files.supportsHiddenFiles',
      this.supportsHiddenFiles,
    );
    // Whether to respect .gitignore settings during file search.
    this.preserveGitignoreSettings = config.get<boolean>(
      'files.preserveGitignoreSettings',
      this.preserveGitignoreSettings,
    );
    // Whether to show the file path in the search results.
    this.showFilePathInResults = config.get<boolean>(
      'files.includeFilePath',
      this.showFilePathInResults,
    );
  }
}
