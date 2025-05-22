import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // File system operations
  openFile: () => ipcRenderer.invoke('open-file-dialog'),
  saveFile: (defaultPath: string, fileContent: string) => 
    ipcRenderer.invoke('save-file-dialog', defaultPath, fileContent),
  readFile: (filePath: string) => ipcRenderer.invoke('read-file', filePath),
  writeFile: (filePath: string, content: string) => 
    ipcRenderer.invoke('write-file', filePath, content),
});

// TypeScript interface for the exposed API
declare global {
  interface Window {
    electronAPI: {
      openFile: () => Promise<string | null>;
      saveFile: (defaultPath: string, fileContent: string) => Promise<string | null>;
      readFile: (filePath: string) => Promise<string>;
      writeFile: (filePath: string, content: string) => Promise<boolean>;
    }
  }
}
