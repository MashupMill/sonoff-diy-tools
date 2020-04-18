import { ipcRenderer as globalIpcRenderer, channels } from './ipc';

const ON_OFF = ['on', 'off']
const STARTUP_OPTS = [...ON_OFF, 'stay'];

function isBlank(value) {
    return !(typeof value === 'string' && value.trim().length > 0);
}

export default class DeviceApi {
    constructor({ id, addresses = [], port = 8081, ipcRenderer = globalIpcRenderer } = {}) {
        if (isBlank(id)) throw new Error('Device id must not be blank');
        if (!addresses || addresses.length < 1) throw new Error('Device must have an address');
        this.ipcRenderer = ipcRenderer;
        this.id = id;
        this.addresses = addresses;
        this.url = `http://${this.addresses[0]}:${port}`;
    }

    async doRequest(url, data) {
        return new Promise((resolve, reject) => {
            this.ipcRenderer.once(channels.DEVICE_API, (event, args) => {
                if (args && args.error === 0) {
                    resolve(typeof args.data === 'string' ? JSON.parse(args.data) : args.data)
                } else {
                    reject(args);
                }
            });
            this.ipcRenderer.send(channels.DEVICE_API, { url, data });
        });
    }

    async getInfo() {
        const url = `${this.url}/zeroconf/info`;
        const data = { deviceid: this.id, data: {} };
        return await this.doRequest(url, data);
    }

    async switch(turnOn) {
        const url = `${this.url}/zeroconf/switch`;
        const data = { deviceid: this.id, data: { switch: turnOn ? 'on' : 'off' } };
        return await this.doRequest(url, data);
    }

    async setPowerOnState(startup) {
        if (STARTUP_OPTS.indexOf(startup) < 0) {
            throw new Error(`Invalid power on state value "${startup}". Must be one of ${STARTUP_OPTS.join(', ')}`)
        }
        const url = `${this.url}/zeroconf/startup`;
        const data = { deviceid: this.id, data: { startup } };
        return await this.doRequest(url, data);
    }

    async getSignalStrength() {
        const url = `${this.url}/zeroconf/signal_strength`;
        const data = { deviceid: this.id, data: {} };
        return await this.doRequest(url, data);
    }

    async setInching({ pulse, pulseWidth }) {
        if (ON_OFF.indexOf(pulse) < 0) {
            throw new Error(`Invalid pulse value "${pulse}". Must be one of ${ON_OFF.join(', ')}`)
        }
        if (typeof pulseWidth !== 'number' || pulseWidth < 500 || pulseWidth > 36000000 || pulseWidth % 500 !== 0) {
            throw new Error(`Invalid pulseWidth value "${pulseWidth}". Must be a number that is a multiple of 500 between 500 and 36000000`);
        }
        const url = `${this.url}/zeroconf/pulse`;
        const data = { deviceid: this.id, data: { pulse, pulseWidth } };
        return await this.doRequest(url, data);
    }

    async setWifi({ ssid, password }) {
        if (isBlank(ssid)) {
            throw new Error(`Invalid ssid value "${ssid}". Must not be blank`);
        }
        if (isBlank(password)) {
            throw new Error(`Invalid password value "${password}". Must not be blank`);
        }
        const url = `${this.url}/zeroconf/wifi`;
        const data = { deviceid: this.id, data: { ssid, password } };
        return await this.doRequest(url, data);
    }

    async setOtaUnlock() {
        const url = `${this.url}/zeroconf/ota_unlock`;
        const data = { deviceid: this.id, data: {} };
        return await this.doRequest(url, data);
    }

    async flashOta({ downloadUrl, sha256sum }) {
        if (isBlank(downloadUrl)) {
            throw new Error(`Invalid download url value "${downloadUrl}". Must not be blank`);
        }
        if (isBlank(sha256sum)) {
            throw new Error(`Invalid sha256 sum value "${sha256sum}". Must not be blank`);
        }
        const url = `${this.url}/zeroconf/ota_flash`;
        const data = { deviceid: this.id, data: { downloadUrl, sha256sum } };
        return await this.doRequest(url, data);
    }

    async verifyOtaUrl({ url }) {
        return new Promise((resolve, reject) => {
            this.ipcRenderer.once(channels.VERIFY_OTA_URL, (event, args) =>
            args && args.error
                ? reject(args.error)
                : resolve(args));
            this.ipcRenderer.send(channels.VERIFY_OTA_URL, url);
        });
    }
}
