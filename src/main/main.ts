/* eslint global-require: off, no-console: off, promise/always-return: off */
import Path from 'path';
import { app, BrowserWindow, shell, ipcMain, Menu, Tray } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import { resolveHtmlPath, loadConfig, saveConfig, lazy } from './util';
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

  ipcMain.on('minimize', async () => {
    const win = BrowserWindow.getFocusedWindow();
    win?.hide();
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

  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });
  // mainWindow.webContents.openDevTools();

  const updater = new AppUpdater();
  log.debug('Updater', updater);

  return mainWindow;
};

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(async () => {
    const assetsPath = app.isPackaged ? Path.join(process.resourcesPath, 'assets') : 'assets';
    const iconPath = Path.join(assetsPath, 'icon.png');

    const tray = new Tray(iconPath);
    const contextMenu = Menu.buildFromTemplate([
      { label: 'Show/Hide', click: () => (mainWindow?.isVisible() ? mainWindow.hide() : mainWindow?.show()) },
      { label: 'Quit', click: () => app.quit() },
    ]);
    tray.setToolTip('Litra glow control');
    tray.setContextMenu(contextMenu);

    createWindow();

    const getDevice = lazy(() => {
      const device = Litra.create();
      Litra.listen(device, (name, value) => mainWindow?.webContents.send('litra-update', [name, value]));
      return device;
    });

    ipcMain.on('config-save', async (_, config: any) => {
      await saveConfig(configFilename, config);
    });
    ipcMain.on('litra-state', async (_: any, state: boolean) => {
      Litra.setState(getDevice(), state);
    });
    ipcMain.on('litra-brightness', async (_: any, level: number) => {
      Litra.setBrightness(getDevice(), level);
    });
    ipcMain.on('litra-temperature', async (_: any, level: number) => {
      Litra.setTemperature(getDevice(), level);
    });

    app.on('activate', () => {
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
