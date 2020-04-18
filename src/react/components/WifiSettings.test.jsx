import React from 'react'
import { render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from "@testing-library/user-event";
import WifiSettings from './WifiSettings';

const ssid = 'my-ssid';
const password = 'my-password';
const deviceApi = {};

beforeEach(() => {
    deviceApi.setWifi = jest.fn();
});

it('should display existing SSID', () => {
    const { container } = render(<WifiSettings initialSsid={ssid} />);
    expect(container).toHaveTextContent(ssid);
});
it('should not display textbox by default', () => {
    const { queryByRole } = render(<WifiSettings initialSsid={ssid} />);
    expect(queryByRole('textbox')).toBeNull();
});
it('should display textbox for SSID and Password when clicking the Edit Wifi Settings button', () => {
    const { getByRole, getByLabelText } = render(<WifiSettings initialSsid={ssid} />);
    getByRole('button', { name: /edit/i }).click();
    expect(getByRole('textbox', { name: 'SSID' })).toBeVisible();
    expect(getByLabelText('Password')).toBeVisible();
});
it('password should be hidden by default', () => {
    const { getByRole, getByLabelText } = render(<WifiSettings initialSsid={ssid} />);
    getByRole('button', { name: /edit/i }).click();
    expect(getByLabelText('Password')).toHaveAttribute('type', 'password');
});
it('clicking show password should make the password visible', () => {
    const { getByRole } = render(<WifiSettings initialSsid={ssid} />);
    getByRole('button', { name: /edit/i }).click();
    getByRole('button', { name: /show password/i }).click();
    expect(getByRole('textbox', { name: 'Password' })).toBeVisible();
    expect(getByRole('textbox', { name: 'Password' })).toHaveAttribute('type', 'text');
});
it('clicking cancel should take user back to just displaying the SSID', () => {
    const { getByRole, queryByRole } = render(<WifiSettings initialSsid={ssid} />);
    getByRole('button', { name: /edit/i }).click();
    getByRole('button', { name: /cancel/i }).click();
    expect(queryByRole('textbox')).toBeNull();
    expect(getByRole('button', { name: /edit/i })).toBeVisible();
});
it('save button should be disabled when there is no password', () => {
    const { getByRole } = render(<WifiSettings initialSsid={ssid} />);
    getByRole('button', { name: /edit/i }).click();
    getByRole('button', { name: /show password/i }).click();
    expect(getByRole('button', { name: /save/i })).toBeDisabled();
});
it('save button should be enabled when the password is present', async () => {
    const { getByRole } = render(<WifiSettings initialSsid={ssid} />);
    getByRole('button', { name: /edit/i }).click();
    getByRole('button', { name: /show password/i }).click();
    const passInput = getByRole('textbox', { name: 'Password' });
    await userEvent.type(passInput, password);
    expect(getByRole('button', { name: /save/i })).not.toBeDisabled();
});
it('save display confirmation dialog when clicking save', async () => {
    const { getByRole } = render(<WifiSettings initialSsid={ssid} />);
    getByRole('button', { name: /edit/i }).click();
    getByRole('button', { name: /show password/i }).click();
    const passInput = getByRole('textbox', { name: 'Password' });
    await userEvent.type(passInput, password);
    getByRole('button', { name: /save/i }).click();
    expect(getByRole('heading', { name: /double check/i })).toBeVisible();
});
it('closing the dialog should actually close the dialog', async () => {
    const { getByRole, queryByRole } = render(<WifiSettings initialSsid={ssid} />);
    getByRole('button', { name: /edit/i }).click();
    getByRole('button', { name: /show password/i }).click();
    const passInput = getByRole('textbox', { name: 'Password' });
    await userEvent.type(passInput, password);
    getByRole('button', { name: /save/i }).click();
    getByRole('button', { name: /close/i }).click();
    await waitFor(() => {
        expect(queryByRole('heading', { name: /double check/i })).toBeNull();
    });
});
it('saving the dialog should save via deviceApi', async () => {
    const { getByRole } = render(<WifiSettings initialSsid={ssid} deviceApi={deviceApi} />);
    getByRole('button', { name: /edit/i }).click();
    getByRole('button', { name: /show password/i }).click();
    const passInput = getByRole('textbox', { name: 'Password' });
    await userEvent.type(passInput, password);
    getByRole('button', { name: /save/i }).click();
    getByRole('button', { name: /save wifi settings/i }).click();
    expect(deviceApi.setWifi.mock.calls[0][0]).toEqual({ ssid, password });
});
it('saving the dialog should close the dialog', async () => {
    const { getByRole, queryByRole } = render(<WifiSettings initialSsid={ssid} deviceApi={deviceApi} />);
    getByRole('button', { name: /edit/i }).click();
    getByRole('button', { name: /show password/i }).click();
    const passInput = getByRole('textbox', { name: 'Password' });
    await userEvent.type(passInput, password);
    getByRole('button', { name: /save/i }).click();
    getByRole('button', { name: /save wifi settings/i }).click();
    await waitFor(() => {
        expect(queryByRole('heading', { name: /double check/i })).toBeNull();
    });
});
it('saving the dialog should go back to only showing the SSID', async () => {
    const { getByRole, queryByRole } = render(<WifiSettings initialSsid={ssid} deviceApi={deviceApi} />);
    getByRole('button', { name: /edit/i }).click();
    getByRole('button', { name: /show password/i }).click();
    const passInput = getByRole('textbox', { name: 'Password' });
    await userEvent.type(passInput, password);
    getByRole('button', { name: /save/i }).click();
    getByRole('button', { name: /save wifi settings/i }).click();
    expect(queryByRole('textbox')).toBeNull();
    expect(getByRole('button', { name: /edit/i })).toBeVisible();
});

it('changing wifi credentials should display the value typed in the confirmation dialog', async () => {
    const { getByRole } = render(<WifiSettings />);
    getByRole('button', { name: /edit/i }).click();
    const ssidInput = getByRole('textbox', { name: 'SSID' });
    await userEvent.type(ssidInput, ssid);
    getByRole('button', { name: /show password/i }).click();
    const passInput = getByRole('textbox', { name: 'Password' });
    await userEvent.type(passInput, password);
    getByRole('button', { name: /save/i }).click();
    expect(getByRole('heading', { name: new RegExp(`SSID: ${ssid}`, 'i') })).toBeVisible();
    expect(getByRole('heading', { name: new RegExp(`Password: ${password}`, 'i') })).toBeVisible();
});
