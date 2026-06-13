import { TryCatchTemplate } from '../types';

/**
 * EXTENSION_ID: The unique identifier of the extension.
 * @type {string}
 * @public
 * @memberof Constants
 * @example
 * console.log(EXTENSION_ID);
 *
 * @returns {string} - The unique identifier of the extension
 */
export const EXTENSION_ID: string = 'codeErrorGuardPlus';

/**
 * EXTENSION_NAME: The name of the extension.
 * @type {string}
 * @public
 * @memberof Constants
 * @example
 * console.log(EXTENSION_NAME);
 *
 * @returns {string} - The name of the extension
 */
export const EXTENSION_NAME: string = 'vscode-code-error-guard-plus';

/**
 * EXTENSION_DISPLAY_NAME: The name of the extension.
 * @type {string}
 * @public
 * @memberof Constants
 * @example
 * console.log(EXTENSION_DISPLAY_NAME);
 *
 * @returns {string} - The name of the extension
 */
export const EXTENSION_DISPLAY_NAME: string = 'CodeErrorGuard+';

/**
 * USER_NAME: The githubUsername of the extension.
 * @type {string}
 * @public
 * @memberof Constants
 * @example
 * console.log(USER_NAME);
 *
 * @returns {string} - The githubUsername of the extension
 */
export const USER_NAME: string = 'ManuelGil';

/**
 * USER_PUBLISHER: The publisher of the extension.
 * @type {string}
 * @public
 * @memberof Constants
 * @example
 * console.log(USER_PUBLISHER);
 *
 * @returns {string} - The publisher of the extension
 */
export const USER_PUBLISHER: string = 'imgildev';

/**
 * EXTENSION_REPOSITORY_URL: The repository URL of the extension.
 * @type {string}
 * @public
 * @memberof Constants
 * @example
 * console.log(EXTENSION_REPOSITORY_URL);
 *
 * @returns {string} - The repository URL of the extension
 */
export const EXTENSION_REPOSITORY_URL: string = `https://github.com/${USER_NAME}/${EXTENSION_NAME}`;

/**
 * DEFAULT_ENABLE_SETTING: The default value for the enable setting.
 * @type {boolean}
 * @public
 * @memberof Constants
 * @example
 * console.log(DEFAULT_ENABLE_SETTING);
 *
 * @returns {boolean} - The default value for the enable setting
 */
export const DEFAULT_ENABLE_SETTING: boolean = true;

/**
 * DEFAULT_LANGUAGE_SETTING: The default value for the language setting.
 * @type {string}
 * @public
 * @memberof Constants
 * @example
 * console.log(DEFAULT_LANGUAGE_SETTING);
 *
 * @returns {string} - The default value for the language setting
 */
export const DEFAULT_LANGUAGE_SETTING: string = 'javascript';

/**
 * DEFAULT_ERROR_VARIABLE: The default name for error variables in catch blocks.
 */
export const DEFAULT_ERROR_VARIABLE: string = 'error';

/**
 * DEFAULT_CATCH_BLOCK_CONTENT: The default body inserted inside catch blocks.
 */
export const DEFAULT_CATCH_BLOCK_CONTENT: string = '// TODO: handle error';

/**
 * DEFAULT_CATCH_FOLLOW_UP_STATEMENT: The default follow-up expression executed inside catch blocks.
 */
export const DEFAULT_CATCH_FOLLOW_UP_STATEMENT: string =
  '// TODO: surface or rethrow error';

/**
 * DEFAULT_CUSTOM_TRY_CATCH_TEMPLATES: The default set of custom try/catch templates.
 */
export const DEFAULT_CUSTOM_TRY_CATCH_TEMPLATES: TryCatchTemplate[] = [];

/**
 * The default file patterns to include in the extension's file operations.
 * @example console.log(DEFAULT_INCLUDE_PATTERNS);
 */
export const DEFAULT_INCLUDE_PATTERNS: string[] = ['**/*.{js,jsx,ts,tsx}'];

/**
 * The default file patterns to exclude from the extension's file operations.
 * @example console.log(DEFAULT_EXCLUDE_PATTERNS);
 */
export const DEFAULT_EXCLUDE_PATTERNS: string[] = [
  '**/node_modules/**',
  '**/dist/**',
  '**/out/**',
  '**/build/**',
  '**/vendor/**',
];

/**
 * The default maximum recursion depth for file search operations (0 means unlimited).
 * @example console.log(DEFAULT_MAX_SEARCH_RECURSION_DEPTH);
 */
export const DEFAULT_MAX_SEARCH_RECURSION_DEPTH: number = 0;

/**
 * The default value for whether to include hidden files in search operations.
 * @example console.log(DEFAULT_SUPPORTS_HIDDEN_FILES);
 */
export const DEFAULT_SUPPORTS_HIDDEN_FILES: boolean = true;

/**
 * The default value for whether to respect .gitignore settings during file search.
 * @example console.log(DEFAULT_PRESERVE_GITIGNORE_SETTINGS);
 */
export const DEFAULT_PRESERVE_GITIGNORE_SETTINGS: boolean = false;

/**
 * The default value for whether to show the file path in search results.
 * @example console.log(DEFAULT_SHOW_FILE_PATH);
 */
export const DEFAULT_SHOW_FILE_PATH: boolean = true;
