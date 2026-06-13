/**
 * TryCatchTemplate interface
 * @description Interface for the try-catch block template.
 * @export
 * @interface TryCatchTemplate
 * @example
 * export interface TryCatchTemplate {
 * }
 *
 * @param {string} language The language of the template.
 * @param {string[]} tryBlock The try block.
 * @param {string[]} catchBlock The catch block.
 *
 * @returns {TryCatchTemplate} The try-catch block template.
 */
export interface TryCatchTemplate {
  language: string;
  tryBlock: string[];
  catchBlock: string[];
}
