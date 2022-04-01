/* eslint global-require: off, no-console: off, promise/always-return: off */
import Path from 'path';
import { app, BrowserWindow, shell, ipcMain, Menu } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
// import MenuBuilder from './build-menu';
import { resolveHtmlPath, loadConfig, saveConfig } from './util';
import * as Litra from './providers/logitech/litra';

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDevelopment = process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDevelopment) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const configFilename = Path.resolve(app.getPath('userData'), 'config.json');

const createWindow = async () => {
  if (isDevelopment) {
    await installExtensions();
  }

  const device = Litra.create();
  app.once('window-all-closed', async () => {
    (await device).dispose();
  });

  ipcMain.on('config-save', async (_, config: any) => {
    await saveConfig(configFilename, config);
  });

  ipcMain.on('litra-state', async (_: any, state: boolean) => {
    Litra.setState(await device, state);
  });
  ipcMain.on('litra-brightness', async (_: any, level: number) => {
    Litra.setBrightness(await device, level);
  });
  ipcMain.on('litra-temperature', async (_: any, level: number) => {
    Litra.setTemperature(await device, level);
  });

  ipcMain.on('minimize', async () => {
    const win = BrowserWindow.getFocusedWindow();
    if (win?.isMinimized()) {
      win.restore();
    } else {
      win?.minimize();
    }
  });
  ipcMain.on('close', async () => {
    const win = BrowserWindow.getFocusedWindow();
    win?.close();
  });

  const RESOURCES_PATH = app.isPackaged ? Path.join(process.resourcesPath, 'assets') : Path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return Path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    autoHideMenuBar: true,
    show: false,
    width: 400,
    height: 230,
    resizable: false,
    darkTheme: true,
    frame: false,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged ? Path.join(__dirname, 'preload.js') : Path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  const config = await loadConfig(configFilename, {
    brightness: 50,
    temperature: 4000,
  });
  mainWindow.loadURL(resolveHtmlPath('index.html', { config }));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  Menu.setApplicationMenu(null);
  // const menuBuilder = new MenuBuilder(mainWindow);
  // menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });
  // mainWindow.webContents.openDevTools();

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
