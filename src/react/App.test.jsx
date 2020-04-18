import React from 'react';
import { render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { ipcMain, ipcRenderer, channels } from './ipc';
import App from './App';
jest.mock('./ipc');

const appName = 'My App Name';
const appVersion = '1.0.0';

beforeEach(() => {
    ipcMain.removeAllListeners();
    ipcRenderer.removeAllListeners();
});

it('renders without crashing', () => {
    render(<App />);
});

it('displays heading with app name and app version', async () => {
    const { getByText } = render(<App />);

    ipcMain.send(channels.APP_INFO, { appName, appVersion });

    await waitFor(() => expect(getByText(`${appName}`)).toBeVisible());
    await waitFor(() => expect(getByText(`v${appVersion}`)).toBeVisible());
});

it('displays no devices found by default', () => {
    const { getByRole } = render(<App />);
    expect(getByRole('heading', { name: /no devices found/i })).toBeVisible();
});

it('displays a device result for each device added/updated', async () => {
    const device1 = { fqdn: 'device1.local', addresses: ['192.168.100.101'], port: 8080, name: 'device 1', txt: { id: 'device1' } };
    const device2 = { fqdn: 'device2.local', addresses: ['192.168.100.102'], port: 8080, name: 'device 2', txt: { id: 'device2' } };
    const { findByRole } = render(<App />);

    ipcMain.send(channels.DEVICE_ADDED, device1);
    ipcMain.send(channels.DEVICE_UPDATED, device1);
    ipcMain.send(channels.DEVICE_ADDED, device2);

    expect(await findByRole('heading', { name: new RegExp(`^${device1.name}.*$`) })).toBeVisible();
    expect(await findByRole('heading', { name: new RegExp(`^${device2.name}.*$`) })).toBeVisible();
});

it('removes device when ipc says device was removed', async () => {
    const device1 = { fqdn: 'device1.local', addresses: ['192.168.100.101'], port: 8080, name: 'device 1', txt: { id: 'device1' } };
    const { findByRole } = render(<App />);

    ipcMain.send(channels.DEVICE_ADDED, device1);
    const deviceResultHeading = await findByRole('heading', { name: new RegExp(`^${device1.name}.*$`) });
    expect(deviceResultHeading).toBeVisible();
    ipcMain.send(channels.DEVICE_REMOVED, device1);
    await waitFor(() => expect(deviceResultHeading).not.toBeInTheDocument());
});
