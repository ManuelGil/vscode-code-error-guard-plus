import {
  Event,
  EventEmitter,
  ProviderResult,
  ThemeIcon,
  TreeDataProvider,
  TreeItem,
} from 'vscode';

import { CommandIds, EXTENSION_ID } from '../configs';
import { ListTryCatchController } from '../controllers';
import { readFileContent, relativePath } from '../helpers';
import { NodeModel } from '../models';
import { TryCatchService } from '../services';

/**
 * The ListTryCatchProvider class
 *
 * @class
 * @classdesc The class that represents the list of files provider.
 * @export
 * @public
 * @implements {TreeDataProvider<NodeModel>}
 * @property {EventEmitter<NodeModel | undefined | null | void>} _onDidChangeTreeData - The onDidChangeTreeData event emitter
 * @property {Event<NodeModel | undefined | null | void>} onDidChangeTreeData - The onDidChangeTreeData event
 * @property {ListTryCatchController} controller - The list of files controller
 * @example
 * const provider = new ListTryCatchProvider();
 *
 * @see https://code.visualstudio.com/api/references/vscode-api#TreeDataProvider
 */
export class ListTryCatchProvider implements TreeDataProvider<NodeModel> {
  // -----------------------------------------------------------------
  // Properties
  // -----------------------------------------------------------------

  // Private properties
  /**
   * The onDidChangeTreeData event emitter.
   * @type {EventEmitter<NodeModel | undefined | null | void>}
   * @private
   * @memberof ListTryCatchProvider
   * @example
   * this._onDidChangeTreeData = new EventEmitter<Node | undefined | null | void>();
   * this.onDidChangeTreeData = this._onDidChangeTreeData.event;
   *
   * @see https://code.visualstudio.com/api/references/vscode-api#EventEmitter
   */
  private _onDidChangeTreeData: EventEmitter<
    NodeModel | undefined | null | void
  >;

  /**
   * Indicates whether the provider has been disposed.
   * @type {boolean}
   * @private
   * @memberof ListTryCatchProvider
   * @example
   * this._isDisposed = false;
   */
  private _isDisposed = false;

  /**
   * The cached nodes.
   * @type {NodeModel[] | undefined}
   * @private
   * @memberof ListTryCatchProvider
   * @example
   * this._cachedNodes = undefined;
   */
  private _cachedNodes: NodeModel[] | undefined = undefined;

  /**
   * The cache promise.
   * @type {Promise<NodeModel[] | undefined> | undefined}
   * @private
   * @memberof ListTryCatchProvider
   * @example
   * this._cachePromise = undefined;
   */
  private _cachePromise: Promise<NodeModel[] | undefined> | undefined =
    undefined;

  /**
   * Version token to invalidate in-flight cache loads on refresh.
   */
  private _version = 0;

  // Public properties
  /**
   * The onDidChangeTreeData event.
   * @type {Event<NodeModel | undefined | null | void>}
   * @public
   * @memberof ListTryCatchProvider
   * @example
   * readonly onDidChangeTreeData: Event<Node | undefined | null | void>;
   * this.onDidChangeTreeData = this._onDidChangeTreeData.event;
   *
   * @see https://code.visualstudio.com/api/references/vscode-api#Event
   */
  readonly onDidChangeTreeData: Event<NodeModel | undefined | null | void>;

  // -----------------------------------------------------------------
  // Constructor
  // -----------------------------------------------------------------

  /**
   * Constructor for the ListTryCatchProvider class
   *
   * @constructor
   * @public
   * @memberof ListTryCatchProvider
   */
  constructor(
    readonly controller: ListTryCatchController,
    readonly service: TryCatchService,
  ) {
    this._onDidChangeTreeData = new EventEmitter<
      NodeModel | undefined | null | void
    >();
    this.onDidChangeTreeData = this._onDidChangeTreeData.event;
  }

  // -----------------------------------------------------------------
  // Methods
  // -----------------------------------------------------------------

  // Public methods
  /**
   * Returns the tree item for the supplied element.
   *
   * @function getTreeItem
   * @param {NodeModel} element - The element
   * @public
   * @memberof ListTryCatchProvider
   * @example
   * const treeItem = provider.getTreeItem(element);
   *
   * @returns {TreeItem | Thenable<TreeItem>} - The tree item
   *
   * @see https://code.visualstudio.com/api/references/vscode-api#TreeDataProvider
   */
  getTreeItem(element: NodeModel): TreeItem | Thenable<TreeItem> {
    return element;
  }

  /**
   * Returns the children for the supplied element.
   *
   * @function getChildren
   * @param {NodeModel} [element] - The element
   * @public
   * @memberof ListTryCatchProvider
   * @example
   * const children = provider.getChildren(element);
   *
   * @returns {ProviderResult<NodeModel[]>} - The children
   *
   * @see https://code.visualstudio.com/api/references/vscode-api#TreeDataProvider
   */
  getChildren(element?: NodeModel): ProviderResult<NodeModel[]> {
    if (this._isDisposed) {
      return [];
    }

    if (element) {
      return element.children;
    }

    if (this._cachedNodes) {
      return this._cachedNodes;
    }

    if (this._cachePromise) {
      return this._cachePromise;
    }

    const versionAtStart = this._version;
    this._cachePromise = this.getListTryCatchNodes().then((nodes) => {
      // Ignore if disposed or a newer refresh occurred meanwhile
      if (this._isDisposed || versionAtStart !== this._version) {
        return this._cachedNodes ?? [];
      }
      this._cachedNodes = nodes;
      this._cachePromise = undefined;
      return nodes;
    });

    return this._cachePromise;
  }

  /**
   * Refreshes the tree data by firing the event.
   *
   * @function refresh
   * @public
   * @memberof ListTryCatchProvider
   * @example
   * provider.refresh();
   *
   * @returns {void} - No return value
   */
  refresh(): void {
    if (this._isDisposed) {
      return;
    }

    this._version++;
    this._cachedNodes = undefined;
    this._cachePromise = undefined;
    this._onDidChangeTreeData.fire();
  }

  /**
   * Disposes the provider.
   *
   * @function dispose
   * @public
   * @memberof ListTryCatchProvider
   * @example
   * provider.dispose();
   *
   * @returns {void} - No return value
   */
  dispose(): void {
    if (this._isDisposed) {
      return;
    }

    this._isDisposed = true;
    this._cachedNodes = undefined;
    this._cachePromise = undefined;
    this._onDidChangeTreeData.dispose();
  }

  // Private methods
  /**
   * Gets the list of files.
   *
   * @function getListFiles
   * @private
   * @memberof ListTryCatchProvider
   * @example
   * const files = provider.getListFiles();
   *
   * @returns {Promise<NodeModel[]>} - The list of files
   */
  private async getListTryCatchNodes(): Promise<NodeModel[]> {
    const { defaultLanguage } = this.controller.config;
    const files = await this.controller.getFiles();

    if (!files) {
      return [];
    }

    const detectionRegex =
      this.service.getStructureDetectionRegex(defaultLanguage);

    const { default: pLimit } = await import('p-limit');
    const limit = pLimit(2);

    await Promise.all(
      files.map((file) =>
        limit(async () => {
          if (!file.resourceUri) {
            return file.setChildren([]);
          }

          try {
            const content = await readFileContent(file.resourceUri);

            const children: NodeModel[] = [];

            if (!detectionRegex) {
              file.setChildren([]);
            } else {
              detectionRegex.lastIndex = 0;
              const contentStr = content ?? '';
              const matches: RegExpExecArray[] = [];
              let match: RegExpExecArray | null;

              while ((match = detectionRegex.exec(contentStr)) !== null) {
                if (match.index === detectionRegex.lastIndex) {
                  detectionRegex.lastIndex += 1; // avoid infinite loop
                }
                matches.push(match);
              }

              for (const m of matches) {
                const startIndex = m.index;
                const snippet = contentStr.slice(
                  startIndex,
                  startIndex + m[0].length,
                );

                const extraction = this.service.extractGeneratedPayload(
                  defaultLanguage,
                  snippet,
                );

                if (!extraction) {
                  // Ownership/validation failed — skip
                  continue;
                }

                // Compute 0-based line number from startIndex
                const before = contentStr.slice(0, startIndex);
                const lineNumber = before.split(/\r?\n/).length; // 1-based
                const zeroBasedLine = Math.max(0, lineNumber - 1);

                const label =
                  snippet.split(/\r?\n/)[0].trim() || 'generated try/catch';

                const child = new NodeModel(
                  label,
                  new ThemeIcon('symbol-namespace'),
                  {
                    command: `${EXTENSION_ID}.${CommandIds.ListTryCatchViewGotoLine}`,
                    title: label,
                    arguments: [file.resourceUri, zeroBasedLine],
                  },
                  file.resourceUri,
                  'generatedStructure',
                );

                child.description = `Ln ${lineNumber}`;
                const rel = await relativePath(
                  file.resourceUri,
                  false,
                  this.controller.config,
                );
                child.tooltip = `${rel}:${lineNumber}\n${label}`;
                child.line = zeroBasedLine;
                children.push(child);
              }
            }

            file.setChildren(children);
            // Attach quick context and counts to file node
            const count = children.length;
            file.description =
              count > 0
                ? `${count} Structure${count === 1 ? '' : 's'}`
                : undefined;
            file.tooltip = `${file.resourceUri.fsPath}${
              count > 0 ? `\n${count} Structure${count === 1 ? '' : 's'}` : ''
            }`;
          } catch (error) {
            console.error(
              `Error reading file ${file.resourceUri?.fsPath}:`,
              error instanceof Error ? error.message : String(error),
            );

            file.setChildren([]);
          }
        }),
      ),
    );

    return files.filter((file) => file.children?.length);
  }
}
