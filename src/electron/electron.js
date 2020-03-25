const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
const { createServer } = require('http-server');
const getPort = require('get-port');
const internalIp = require('internal-ip');
const dnssd = require('dnssd2');
// const autoUpdater = require('electron-updater');
const { channels } = require('./constants');

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

    // and load the index.html of the app.
    const startUrl = process.env.ELECTRON_START_URL || url.format({
        pathname: path.join(__dirname, '/../build/index.html'),
        protocol: 'file:',
        slashes: true
    });
    mainWindow.loadURL(startUrl);
    // Open the DevTools.
    mainWindow.webContents.openDevTools();

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
ipcMain.on(channels.APP_INFO, (event) => {
    event.sender.send(channels.APP_INFO, {
        appName: app.name,
        appVersion: app.getVersion(),
        nodeVersion: process.versions.node,
        chromeVersion: process.versions.chrome,
        electronVersion: process.versions.electron,
    });
});

let browser;
ipcMain.on(channels.SCAN_DEVICES, () => {
    if (browser) {
        browser.stop();
    }
    browser = dnssd.Browser(dnssd.tcp('ewelink'))
        .on('serviceUp', service => mainWindow.webContents.send(channels.DEVICE_ADDED, service))
        .on('serviceChanged', service => mainWindow.webContents.send(channels.DEVICE_UPDATED, service))
        .on('serviceDown', service => mainWindow.webContents.send(channels.DEVICE_REMOVED, service))
        .start();
});

ipcMain.on(channels.DEVICE_API, (event, args) => {
    require('axios')
    .post(args.url, args.data)
    .then(response => {
        event.reply(channels.DEVICE_API, response.data);
    })
    .catch(error => {
        console.log(error)
        event.reply(channels.DEVICE_API_ERROR, error);
    })
});

ipcMain.on(channels.VERIFY_OTA_URL, async (event, url) => {
    try {
        const verification = await require('./verifyOtaUrl')(url, STATIC_DIR);
        event.reply(channels.VERIFY_OTA_URL, {...verification, downloadUrl: `${staticUrl}/${verification.filename}`});
    } catch (error) {
        event.reply(channels.VERIFY_OTA_URL, { error });
    }
});
