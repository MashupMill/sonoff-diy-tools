const dnssd = require('dnssd2');
const channels = require('./channels');

module.exports = function ({ app, ipcMain, mainWindow, staticUrl, staticDir }) {
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

    ipcMain.on(channels.VERIFY_OTA_URL, async (event, firwareUrl) => {
        try {
            const verification = await require('./verifyOtaUrl')(firwareUrl, staticDir);
            event.reply(channels.VERIFY_OTA_URL, {...verification, downloadUrl: `${staticUrl}/${verification.filename}`});
        } catch (error) {
            event.reply(channels.VERIFY_OTA_URL, { error });
        }
    });
};
