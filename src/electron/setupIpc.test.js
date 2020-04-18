const createIPCMock = require('electron-mock-ipc').default;
const setupIpc = require('./setupIpc');
const channels = require('./channels');

const { ipcMain, ipcRenderer } = createIPCMock();

const app = {
    name: 'My App',
    getVersion: () => '1.0.0',
};

const waitForReply = (channel) => {
    return new Promise(resolve => {
        ipcRenderer.once(channel, (event, args) => resolve({ event, args }));
    });
}

beforeEach(() => {
    setupIpc({ app, ipcMain });
});

it('should send app info when it gets requested', async () => {
    const replyPromise = waitForReply(channels.APP_INFO);
    ipcRenderer.send(channels.APP_INFO);
    const reply = await replyPromise;
    expect(reply.args.appName).toEqual(app.name);
    expect(reply.args.appVersion).toEqual(app.getVersion());
});

// TODO: test channels
