import React from 'react'
import { render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import WifiSaveConfirmDialog from './WifiSaveConfirmDialog';

it('should display SSID and Password', () => {
    const ssid = 'my-ssid';
    const password = 'my-password';
    const { getByRole } = render(<WifiSaveConfirmDialog isOpen={true} ssid={ssid} password={password} />);
    expect(getByRole('heading', { name: /SSID/ })).toHaveTextContent(ssid);
    expect(getByRole('heading', { name: /password/ })).toHaveTextContent(password);
});
it('should display "Cancel" button', () => {
    const { getByRole } = render(<WifiSaveConfirmDialog isOpen={true} />);
    expect(getByRole('button', { name: 'Cancel' })).toBeVisible();
});
it('clicking cancel should call onClose', () => {
    const onClose = jest.fn();
    const { getByRole } = render(<WifiSaveConfirmDialog isOpen={true} onClose={onClose} />);
    getByRole('button', { name: 'Cancel' }).click();
    expect(onClose.mock.calls.length).toBe(1);
});
it('should display "Save Wifi Settings" button', () => {
    const { getByRole } = render(<WifiSaveConfirmDialog isOpen={true} />);
    expect(getByRole('button', { name: 'Save Wifi Settings' })).toBeVisible();
});
it('clicking save should call onSave', () => {
    const onSave = jest.fn();
    const { getByRole } = render(<WifiSaveConfirmDialog isOpen={true} onSave={onSave} />);
    getByRole('button', { name: 'Save Wifi Settings' }).click();
    expect(onSave.mock.calls.length).toBe(1);
});
it('should focus save button on open', async () => {
    const { container, getByRole } = render(<WifiSaveConfirmDialog isOpen={true} />);
    await waitFor(() => {
        expect(document.activeElement).toBe(getByRole('button', { name: 'Save Wifi Settings' }));
    }, { container });
});
