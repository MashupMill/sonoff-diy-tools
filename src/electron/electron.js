const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
const { createServer } = require('http-server');
const getPort = require('get-port');
const internalIp = require('internal-ip');
// const autoUpdater = require('electron-updater');

const STATIC_DIR = path.join(app.getPath('userData'), 'static');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let staticServer;
let staticUrl;

async function createWindow() {
    // autoUpdater.checkForUpdatesAndNotify();
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1024,
        height: 768,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    require('./setupIpc')({ app, ipcMain, mainWindow, staticUrl, staticDir: STATIC_DIR });

    // and load the index.html of the app.
    const startUrl = process.env.ELECTRON_START_URL || url.format({
        pathname: path.join(__dirname, '/../build/index.html'),
        protocol: 'file:',
        slashes: true
    });
    mainWindow.loadURL(startUrl);
    // Open the DevTools.
    // mainWindow.webContents.openDevTools();

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    });

    const port = await getPort();
    const host = await internalIp.v4();
    staticUrl = `http://${host}:${port}`;
    staticServer = createServer({ root: STATIC_DIR });
    staticServer.listen(port, '0.0.0.0');
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    app.quit()
});

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
});

app.allowRendererProcessReuse = true;

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
