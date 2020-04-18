/* global  window */
const { ipcRenderer } = require('electron');
it('should add ipcRenderer to the window', () => {
    require('./preload');
    expect(window.ipcRenderer).toStrictEqual(ipcRenderer);
});
