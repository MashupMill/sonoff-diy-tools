import createIPCMock from 'electron-mock-ipc';
import channels from '../../electron/channels';

const mocked = createIPCMock();
const ipcMain = mocked.ipcMain;
const ipcRenderer = mocked.ipcRenderer;

export { ipcMain, ipcRenderer, channels };
