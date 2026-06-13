/**
 * The TryCatchDeclaration interface.
 *
 * @interface
 * @classdesc The interface that represents the try/catch declaration for a specific language.
 * @export
 * @public
 * @memberof types
 * @example
 * const declaration: TryCatchDeclaration = {
 *   language: 'javascript',
 *   tryDeclaration: 'try\\s*\\{',
 *   catchDeclaration: '\\}\\s*catch\\s*\\(([^)]+)\\)\\s*\\{',
 *   closing: '\\}',
 * };
 */
export interface TryCatchDeclaration {
  /**
   * The language identifier.
   * @type {string}
   * @public
   * @memberof TryCatchDeclaration
   * @example
   * 'javascript', 'typescript', 'java', etc.
   */
  language: string;

  /**
   * The regex pattern for try declaration.
   * @type {string}
   * @public
   * @memberof TryCatchDeclaration
   * @example
   * 'try\\s*\\{'
   */
  tryDeclaration: string;

  /**
   * The regex pattern for catch declaration.
   * @type {string}
   * @public
   * @memberof TryCatchDeclaration
   * @example
   * '\\}\\s*catch\\s*\\(([^)]+)\\)\\s*\\{'
   */
  catchDeclaration: string;

  /**
   * The regex pattern for closing bracket.
   * @type {string}
   * @public
   * @memberof TryCatchDeclaration
   * @example
   * '\\}'
   */
  closing: string;
}
