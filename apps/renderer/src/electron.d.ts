interface ElectronAPI {
  openFile: () => Promise<string | null>;
  saveFile: (defaultPath: string, fileContent: string) => Promise<string | null>;
  readFile: (filePath: string) => Promise<string>;
  writeFile: (filePath: string, content: string) => Promise<boolean>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
