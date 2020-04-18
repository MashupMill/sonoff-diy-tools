import React from 'react';
import { render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from "@testing-library/user-event";
import { deviceApi } from '../DeviceApi';
import DeviceResult from './DeviceResult';
import { act } from 'react-dom/test-utils';
jest.mock('../DeviceApi');

const device = {
    name: 'foo',
    txt: {
        id: 'abc123'
    },
    port: 8080,
    addresses: ['192.168.100.100'],
};

beforeEach(() => {
    deviceApi.getInfo.mockResolvedValueOnce({ switch: 'on' });
});

it('should display heading with device name', async () => {
    await act(async () => {
        const { getByRole } = render(<DeviceResult device={device} />);
        expect(getByRole('heading', { name: /foo/i })).toBeVisible();
    });
});

it('flash button should be disabled by default', async () => {
    await act(async () => {
        const { getByRole } = render(<DeviceResult device={device} />);
        expect(getByRole('button', { name: /flash/i })).toBeDisabled();
    });
});

it('flash button should be enabled once settings are loaded', async () => {
    await act(async () => {
        const { getByRole } = render(<DeviceResult device={device} />);
        await waitFor(() => expect(getByRole('button', { name: /flash/i })).not.toBeDisabled());
    });
});

it('click the flash button should open the flash dialog', async () => {
    await act(async () => {
        const { getByRole } = render(<DeviceResult device={device} />);
        await waitFor(() => expect(getByRole('button', { name: /flash/i })).not.toBeDisabled());
        userEvent.click(getByRole('button', { name: /flash/i }));
        expect(getByRole('heading', { name: /flash ota file/i })).toBeVisible();
    });
});

it('closing the flash dialog should actually close the flash dialog', async () => {
    await act(async () => {
        const { getByRole, queryByRole } = render(<DeviceResult device={device} />);
        await waitFor(() => expect(getByRole('button', { name: /flash/i })).not.toBeDisabled());
        userEvent.click(getByRole('button', { name: /flash/i }));
        userEvent.click(getByRole('button', { name: /close/i }));
        await waitFor(() => expect(queryByRole('heading', { name: /flash ota file/i })).toBeNull());
    });
});

it('settings button should be disabled by default', async () => {
    await act(async () => {
        const { getByRole } = render(<DeviceResult device={device} />);
        expect(getByRole('button', { name: /show settings/i })).toBeDisabled();
    });
});

it('settings button should be enabled once settings are loaded', async () => {
    await act(async () => {
        const { getByRole } = render(<DeviceResult device={device} />);
        await waitFor(() => expect(getByRole('button', { name: /show settings/i })).not.toBeDisabled());
    });
});

it('clicking the settings button should change the settings button label', async () => {
    await act(async () => {
        const { getByRole } = render(<DeviceResult device={device} />);
        const settingsButton = getByRole('button', { name: /show settings/i });
        await waitFor(() => expect(settingsButton).not.toBeDisabled());
        userEvent.click(settingsButton);
        expect(settingsButton).toBe(getByRole('button', { name: /hide settings/i }));
    });
});

it('clicking the settings button should display the device configuration', async () => {
    await act(async () => {
        const { getByRole } = render(<DeviceResult device={device} />);
        const settingsButton = getByRole('button', { name: /show settings/i });
        await waitFor(() => expect(settingsButton).not.toBeDisabled());
        userEvent.click(settingsButton);
        expect(getByRole('heading', { name: /device configuration/i })).toBeVisible();
    });
});

it('clicking the settings button when the device configuration is open should close the device configuration', async () => {
    await act(async () => {
        const { getByRole, queryByRole } = render(<DeviceResult device={device} />);
        const settingsButton = getByRole('button', { name: /show settings/i });
        await waitFor(() => expect(settingsButton).not.toBeDisabled());
        userEvent.click(settingsButton);
        expect(getByRole('heading', { name: /device configuration/i })).toBeVisible();
        userEvent.click(settingsButton);
        await waitFor(() => expect(queryByRole('heading', { name: /device configuration/i })).toBeNull());
    });
});

it('should disable the on/off switch until settings are loaded', async () => {
    await act(async () => {
        const { getByRole } = render(<DeviceResult device={device} />);
        const stateToggle = getByRole('checkbox', { name: /turn/i });
        expect(stateToggle).toBeDisabled();
        await waitFor(() => expect(stateToggle).not.toBeDisabled());
    });
});

it('should display the switch as on when the device settings report being on', async () => {
    await act(async () => {
        const { getByRole } = render(<DeviceResult device={device} />);
        const stateToggle = getByRole('checkbox', { name: /turn/i });
        await waitFor(() => expect(stateToggle).not.toBeDisabled());
        expect(stateToggle).toBeChecked();
    });
});


it('clicking the state toggle when it was initially on should turn it off', async () => {
    await act(async () => {
        deviceApi.getInfo.mockReset()
            .mockResolvedValueOnce({ switch: 'on' })
            .mockResolvedValueOnce({ switch: 'off' });
        const { getByRole } = render(<DeviceResult device={device} />);
        const stateToggle = getByRole('checkbox', { name: /turn/i });
        await waitFor(() => expect(stateToggle).not.toBeDisabled());
        expect(stateToggle).toBeChecked();
        userEvent.click(stateToggle);
        await waitFor(() => expect(stateToggle).not.toBeChecked());
        expect(deviceApi.switch.mock.calls[0][0]).toBe(false);
    });
});

it('changing power on state should save the power on state via the api', async () => {
    await act(async () => {
        deviceApi.getInfo.mockReset()
            .mockResolvedValueOnce({ switch: 'on', startup: 'on' })
            .mockResolvedValueOnce({ switch: 'off', startup: 'off' });

        const { getByRole } = render(<DeviceResult device={device} />);

        // make settings visible
        const settingsButton = getByRole('button', { name: /show settings/i });
        await waitFor(() => expect(settingsButton).not.toBeDisabled());
        userEvent.click(settingsButton);

        // make settings changes
        const configField = getByRole('combobox', { name: /power on state/i });
        userEvent.selectOptions(configField, 'off');
        expect(deviceApi.setPowerOnState.mock.calls[0][0]).toBe('off');
    });
});

it('changing pulse enabled settings should save the pulse enabled settings via the api', async () => {
    await act(async () => {
        deviceApi.getInfo.mockReset()
            .mockResolvedValueOnce({ switch: 'on', pulse: 'on' })
            .mockResolvedValueOnce({ switch: 'off', pulse: 'off' });

        const { getByRole } = render(<DeviceResult device={device} />);

        // make settings visible
        const settingsButton = getByRole('button', { name: /show settings/i });
        await waitFor(() => expect(settingsButton).not.toBeDisabled());
        userEvent.click(settingsButton);

        // make settings changes
        const configField = getByRole('checkbox', { name: /inching enabled/i });
        userEvent.click(configField);
        const lastCall = deviceApi.setInching.mock.calls[deviceApi.setInching.mock.calls.length - 1];
        expect(lastCall[0].pulse).toBe('off');
    });
});

it('changing pulse width settings should save the pulse width settings via the api', async () => {
    await act(async () => {
        deviceApi.getInfo.mockReset()
            .mockResolvedValueOnce({ switch: 'on', pulseWidth: 500 })
            .mockResolvedValueOnce({ switch: 'off', pulseWidth: 5000 });

        const { getByRole } = render(<DeviceResult device={device} />);

        // make settings visible
        const settingsButton = getByRole('button', { name: /show settings/i });
        await waitFor(() => expect(settingsButton).not.toBeDisabled());
        userEvent.click(settingsButton);

        // make settings changes
        const configField = getByRole('textbox', { name: /pulse width/i });
        await userEvent.type(configField, '0');
        const lastCall = deviceApi.setInching.mock.calls[deviceApi.setInching.mock.calls.length - 1];
        expect(lastCall[0].pulseWidth).toBe(5000);
    });
});
