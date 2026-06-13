/**
 * Command identifiers.
 */
export enum CommandIds {
  ChangeWorkspace = 'changeWorkspace',
  InsertTryCatch = 'insertTryCatch',
  RemoveGeneratedTryCatch = 'removeGeneratedTryCatch',
  RemoveGeneratedTryCatchFile = 'removeGeneratedTryCatchFile',
  ListTryCatchViewRefreshList = 'listTryCatchView.refreshList',
  ListTryCatchViewOpenFile = 'listTryCatchView.openFile',
  ListTryCatchViewGotoLine = 'listTryCatchView.gotoLine',
  ListTryCatchViewRevealFile = 'listTryCatchView.revealFile',
  ListTryCatchViewCopyPath = 'listTryCatchView.copyPath',
  ListTryCatchViewOpenContainingFolder = 'listTryCatchView.openContainingFolder',
  ListTryCatchViewGotoLineFromNode = 'listTryCatchView.gotoLineFromNode',
  ListTryCatchViewCopyGeneratedStructureText = 'listTryCatchView.copyGeneratedStructureText',
}
