import { ipcMain, ipcRenderer, channels } from './ipc';
import DeviceApi from "./DeviceApi";
jest.mock('./ipc');

let api, deviceid, baseUrl;

beforeEach(() => {
    ipcMain.removeAllListeners();
    ipcRenderer.removeAllListeners();
    deviceid = 'abc123';
    const addresses = ['localhost'];
    const port = 8081;
    baseUrl = `http://${addresses[0]}:${port}`;
    api = new DeviceApi({ id: deviceid , addresses, port, ipcRenderer });
});

function stubRequest() {
    let returnValue = { error: 0 };
    const actuals = {
        returns: (payload) => {
            returnValue = payload;
            return actuals;
        }
    };
    ipcMain.once(channels.DEVICE_API, (event, { url, data }) => {
        actuals.url = url;
        actuals.data = data;
        ipcMain.send(channels.DEVICE_API, returnValue);
    })
    return actuals;
}

describe('constructor', () => {
    it('should throw an error if the id is blank', () => {
        expect(() => new DeviceApi()).toThrow('Device id must not be blank');
    });
    it('should throw an error if addresss is not set', () => {
        expect(() => new DeviceApi({ id: deviceid })).toThrow('Device must have an address');
    });
    it('should throw an error if there are no addresses', () => {
        expect(() => new DeviceApi({ id: deviceid, addresses: [] })).toThrow('Device must have an address');
    });
});

describe('doRequest', () => {
    it('should throw if error is truthy', async () => {
        const data = { error: 500 };
        stubRequest().returns(data);
        await expect(api.getInfo()).rejects.toEqual(data);
    });
});

describe('getInfo', () => {
    it('should make request to /zeroconf/info with device id and empty data', async () => {
        const data = { switch: 'on' };
        const actuals = stubRequest().returns({ error: 0, data: JSON.stringify(data) })
        const info = await api.getInfo();
        expect(actuals.url).toEqual(`${baseUrl}/zeroconf/info`);
        expect(actuals.data).toEqual({ deviceid, data: {} })
        expect(info).toEqual(data);
    });
});

describe('switch', () => {
    it('should make request to /zeroconf/switch with switch "on" when given true', async () => {
        const actuals = stubRequest();
        await api.switch(true);
        expect(actuals.url).toEqual(`${baseUrl}/zeroconf/switch`);
        expect(actuals.data).toEqual({ deviceid, data: { switch: 'on' } });
    });
    it('should make request to /zeroconf/switch with switch "off" when given false', async () => {
        const actuals = stubRequest();
        await api.switch(false);
        expect(actuals.url).toEqual(`${baseUrl}/zeroconf/switch`);
        expect(actuals.data).toEqual({ deviceid, data: { switch: 'off' } });
    });
});

describe('setPowerOnState', () => {
    it('should make request to /zeroconf/startup with startup "on" when given "on"', async () => {
        const actuals = stubRequest();
        await api.setPowerOnState('on');
        expect(actuals.url).toEqual(`${baseUrl}/zeroconf/startup`);
        expect(actuals.data.data.startup).toEqual('on');
    });
    it('should make request to /zeroconf/startup with startup "off" when given "off"', async () => {
        const actuals = stubRequest();
        await api.setPowerOnState('off');
        expect(actuals.url).toEqual(`${baseUrl}/zeroconf/startup`);
        expect(actuals.data.data.startup).toEqual('off');
    });
    it('should make request to /zeroconf/startup with startup "stay" when given "stay"', async () => {
        const actuals = stubRequest();
        await api.setPowerOnState('stay');
        expect(actuals.url).toEqual(`${baseUrl}/zeroconf/startup`);
        expect(actuals.data.data.startup).toEqual('stay');
    });
    it('should make request to /zeroconf/startup with startup "stay" when given "stay"', async () => {
        const actuals = stubRequest();
        await api.setPowerOnState('stay');
        expect(actuals.url).toEqual(`${baseUrl}/zeroconf/startup`);
        expect(actuals.data.data.startup).toEqual('stay');
    });
    it('should throw an error when given an invalid value', async () => {
        await expect(api.setPowerOnState('foo')).rejects.toThrow(/Invalid power on state/);
    });
});

describe('getSignalStrength', () => {
    it('should make request to /zeroconf/signal_strength with device id and empty data', async () => {
        const actuals = stubRequest();
        await api.getSignalStrength();
        expect(actuals.url).toEqual(`${baseUrl}/zeroconf/signal_strength`);
        expect(actuals.data).toEqual({ deviceid, data: {} });
    });
});

describe('setInching', () => {

    it('should throw an error when given an invalid pulse value', async () => {
        await expect(api.setInching({ pulse: 'foo', pulseWidth: 500 })).rejects.toThrow(/Invalid pulse value/);
    });
    it('should throw an error when given pulse width less than 500', async () => {
        await expect(api.setInching({ pulse: 'on', pulseWidth: 0 })).rejects.toThrow(/Invalid pulseWidth value/);
    });
    it('should throw an error when given pulse width greater than 500', async () => {
        await expect(api.setInching({ pulse: 'on', pulseWidth: 36000500 })).rejects.toThrow(/Invalid pulseWidth value/);
    });
    it('should throw an error when given pulse width is not evenly divisble by 500', async () => {
        await expect(api.setInching({ pulse: 'on', pulseWidth: 501 })).rejects.toThrow(/Invalid pulseWidth value/);
    });
    it('should throw an error when given pulse width is not a number', async () => {
        await expect(api.setInching({ pulse: 'on', pulseWidth: null })).rejects.toThrow(/Invalid pulseWidth value/);
    });
    it('should make request to /zeroconf/pulse with device id and populaated data', async () => {
        const actuals = stubRequest();
        await api.setInching({ pulse: 'off', pulseWidth: 500 });
        expect(actuals.url).toEqual(`${baseUrl}/zeroconf/pulse`);
        expect(actuals.data).toEqual({ deviceid, data: { pulse: 'off', pulseWidth: 500 } });
    });
});

describe('setWifi', () => {
    it('should throw an error when given an empty string for the ssid value', async () => {
        await expect(api.setWifi({ ssid: '', password: 'pass' })).rejects.toThrow(/Invalid ssid value/);
    });
    it('should throw an error when given an blank string for the ssid value', async () => {
        await expect(api.setWifi({ ssid: ' ', password: 'pass' })).rejects.toThrow(/Invalid ssid value/);
    });
    it('should throw an error when given an blank string for the ssid value', async () => {
        await expect(api.setWifi({ ssid: null, password: 'pass' })).rejects.toThrow(/Invalid ssid value/);
    });
    it('should throw an error when given a blank password', async () => {
        await expect(api.setWifi({ ssid: 'foo', password: null })).rejects.toThrow(/Invalid password value/);
    });
    it('should make request to /zeroconf/wifi with device id and populaated data', async () => {
        const actuals = stubRequest();
        await api.setWifi({ ssid: 'foo', password: 'pass' });
        expect(actuals.url).toEqual(`${baseUrl}/zeroconf/wifi`);
        expect(actuals.data).toEqual({ deviceid, data: { ssid: 'foo', password: 'pass' } });
    });
});

describe('setOtaUnlock', () => {
    it('should make request to /zeroconf/ota_unlock with device id and empty data', async () => {
        const actuals = stubRequest();
        await api.setOtaUnlock();
        expect(actuals.url).toEqual(`${baseUrl}/zeroconf/ota_unlock`);
        expect(actuals.data).toEqual({ deviceid, data: {} });
    });
});

describe('flashOta', () => {
    it('should throw an error when given an empty string for the downloadUrl value', async () => {
        await expect(api.flashOta({ downloadUrl: '', sha256sum: 'sum' })).rejects.toThrow(/Invalid download url value/);
    });
    it('should throw an error when given an blank string for the downloadUrl value', async () => {
        await expect(api.flashOta({ downloadUrl: ' ', sha256sum: 'sum' })).rejects.toThrow(/Invalid download url value/);
    });
    it('should throw an error when given an blank string for the downloadUrl value', async () => {
        await expect(api.flashOta({ downloadUrl: null, sha256sum: 'sum' })).rejects.toThrow(/Invalid download url value/);
    });
    it('should throw an error when given a blank sha256sum', async () => {
        await expect(api.flashOta({ downloadUrl: 'foo', sha256sum: null })).rejects.toThrow(/Invalid sha256 sum value/);
    });
    it('should make request to /zeroconf/wifi with device id and populaated data', async () => {
        const actuals = stubRequest();
        await api.flashOta({ downloadUrl: 'foo', sha256sum: 'sum' });
        expect(actuals.url).toEqual(`${baseUrl}/zeroconf/ota_flash`);
        expect(actuals.data).toEqual({ deviceid, data: { downloadUrl: 'foo', sha256sum: 'sum' } });
    });
});

describe('verifyOtaUrl', () => {
    it('should send request to VERIFY_OTA_URL channel and resolve with a valid response', async () => {
        const data = { foo: 'bar' };
        ipcMain.once(channels.VERIFY_OTA_URL, () => {
            ipcMain.send(channels.VERIFY_OTA_URL, data);
        });
        const response = await api.verifyOtaUrl({ url: baseUrl });
        expect(response).toEqual(data);
    });
    it('should pass the url to VERIFY_OTA_URL channel', async () => {
        let actualUrl;
        ipcMain.once(channels.VERIFY_OTA_URL, (_event, args) => {
            actualUrl = args;
            ipcMain.send(channels.VERIFY_OTA_URL);
        });
        await api.verifyOtaUrl({ url: baseUrl });
        expect(actualUrl).toEqual(baseUrl);
    });
    it('should throw an error if the channel responds with an error', async () => {
        const error = 'bad stuff happened';
        ipcMain.once(channels.VERIFY_OTA_URL, () => {
            ipcMain.send(channels.VERIFY_OTA_URL, { error });
        });

        await expect(api.verifyOtaUrl({ url: baseUrl })).rejects.toEqual(error);
    });
});
