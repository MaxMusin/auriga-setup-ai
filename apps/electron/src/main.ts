import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import isDev from 'electron-is-dev';
import serve from 'electron-serve';

const loadURL = serve({ directory: '../../apps/renderer/dist' });

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    loadURL(mainWindow);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// File system operations
ipcMain.handle('open-file-dialog', async () => {
  if (!mainWindow) return;
  
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'iRacing Setup Files', extensions: ['sto'] },
      { name: 'JSON Files', extensions: ['json'] },
      { name: 'CSV Files', extensions: ['csv'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });
  
  if (canceled || filePaths.length === 0) {
    return null;
  }
  
  return filePaths[0];
});

ipcMain.handle('save-file-dialog', async (_, defaultPath: string, fileContent: string) => {
  if (!mainWindow) return;
  
  const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
    defaultPath,
    filters: [
      { name: 'iRacing Setup Files', extensions: ['sto'] },
      { name: 'JSON Files', extensions: ['json'] }
    ]
  });
  
  if (canceled || !filePath) {
    return null;
  }
  
  fs.writeFileSync(filePath, fileContent);
  return filePath;
});

ipcMain.handle('read-file', async (_, filePath: string) => {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error('Error reading file:', error);
    throw error;
  }
});

ipcMain.handle('write-file', async (_, filePath: string, content: string) => {
  try {
    fs.writeFileSync(filePath, content);
    return true;
  } catch (error) {
    console.error('Error writing file:', error);
    throw error;
  }
});
