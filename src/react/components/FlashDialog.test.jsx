import React from 'react'
import { render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from "@testing-library/user-event";
import FlashDialog from './FlashDialog';
import { act } from 'react-dom/test-utils';

const VALID_URL = 'https://firmware.local/valid';
const deviceApi = {};

beforeEach(() => {
    deviceApi.verifyOtaUrl = jest.fn();
    deviceApi.getInfo = jest.fn();
    deviceApi.setOtaUnlock = jest.fn();
    deviceApi.flashOta = jest.fn();
});

async function doFlash({ getByRole }) {
    await act(async () => {
        await userEvent.type(getByRole('textbox', { type: 'url' }), VALID_URL);
        await waitFor(() => expect(getByRole('button', { name: /flash/i })).not.toBeDisabled());
        userEvent.click(getByRole('button', { name: /flash/i }));
    });
}

it('should render nothing when not open', () => {
    const { container } = render(<FlashDialog isOpen={false} />);
    expect(container).toBeEmpty();
});

it('should prompt for a firmware url when open', () => {
    const { getByRole } = render(<FlashDialog isOpen={true} />);
    expect(getByRole('textbox', { type: 'url' })).toBeVisible();
});

it('should display a cancel button', () => {
    const { getByRole } = render(<FlashDialog isOpen={true} />);
    expect(getByRole('button', { name: /cancel/i })).toBeVisible();
});

it('should display a flash button', () => {
    const { getByRole } = render(<FlashDialog isOpen={true} />);
    expect(getByRole('button', { name: /flash/i })).toBeVisible();
});

it('the flash button should be disabled when not validated', () => {
    const { getByRole } = render(<FlashDialog isOpen={true} />);
    expect(getByRole('button', { name: /flash/i })).toBeDisabled();
});

it('should enable flash button when url is valid', async () => {
    deviceApi.verifyOtaUrl.mockResolvedValue({ size: 500000 });
    const { getByRole } = render(<FlashDialog isOpen={true} deviceApi={deviceApi} />);
    await userEvent.type(getByRole('textbox', { type: 'url' }), VALID_URL);
    await waitFor(() => expect(getByRole('button', { name: /flash/i })).not.toBeDisabled());
});

it('should display an error if the size is too large', async () => {
    deviceApi.verifyOtaUrl.mockResolvedValue({ size: 508001 });
    const { getByRole, getByText } = render(<FlashDialog isOpen={true} deviceApi={deviceApi} />);
    await userEvent.type(getByRole('textbox', { type: 'url' }), VALID_URL);
    await waitFor(() => {
        expect(getByText(/file size .* is greater than the max/i)).toBeVisible();
    });
});

it('should not enable flash button when the size is too large', async () => {
    deviceApi.verifyOtaUrl.mockResolvedValue({ size: 508001 });
    const { getByRole, getByText } = render(<FlashDialog isOpen={true} deviceApi={deviceApi} />);
    await userEvent.type(getByRole('textbox', { type: 'url' }), VALID_URL);
    await waitFor(() => {
        expect(getByText(/file size .* is greater than the max/i)).toBeVisible();
        expect(getByRole('button', { name: /flash/i })).toBeDisabled();
    });
});


it('should not enable flash button when an error is thrown verifying the ota url', async () => {
    deviceApi.verifyOtaUrl.mockImplementation(() => { throw new Error('Foo Error') });
    const { getByRole, getByText } = render(<FlashDialog isOpen={true} deviceApi={deviceApi} />);
    await userEvent.type(getByRole('textbox', { type: 'url' }), VALID_URL);
    await waitFor(() => {
        expect(getByText(/foo error/i)).toBeVisible();
        expect(getByRole('button', { name: /flash/i })).toBeDisabled();
    });
});

it('should perform ota unlock when clicking the flash button if the device is locked', async () => {
    deviceApi.verifyOtaUrl.mockResolvedValue({ size: 500000, downloadUrl: VALID_URL, sha256sum: 'foo' });
    deviceApi.getInfo
        .mockResolvedValueOnce({ otaUnlock: false })
        .mockResolvedValueOnce({ otaUnlock: true });

    const { getByRole } = render(<FlashDialog isOpen={true} deviceApi={deviceApi} />);
    await doFlash({ getByRole });

    expect(deviceApi.setOtaUnlock.mock.calls.length).toBe(1);
});

it('should flash the ota when clicking the flash button after unlocking the device', async () => {
    deviceApi.verifyOtaUrl.mockResolvedValue({ size: 500000, downloadUrl: VALID_URL, sha256sum: 'foo' });
    deviceApi.getInfo
        .mockResolvedValueOnce({ otaUnlock: false })
        .mockResolvedValueOnce({ otaUnlock: true });

    const { getByRole } = render(<FlashDialog isOpen={true} deviceApi={deviceApi} />);
    await doFlash({ getByRole });

    expect(deviceApi.flashOta.mock.calls.length).toBe(1);
});

it('should not perform ota unlock when clicking the flash button if the device is already unlocked', async () => {
    deviceApi.verifyOtaUrl.mockResolvedValue({ size: 500000, downloadUrl: VALID_URL, sha256sum: 'foo' });
    deviceApi.getInfo.mockResolvedValueOnce({ otaUnlock: true });

    const { getByRole } = render(<FlashDialog isOpen={true} deviceApi={deviceApi} />);
    await doFlash({ getByRole });

    expect(deviceApi.setOtaUnlock.mock.calls.length).toBe(0);
});

it('should not flash ota clicking the flash button if the device could not be unlocked', async () => {
    deviceApi.verifyOtaUrl.mockResolvedValue({ size: 500000, downloadUrl: VALID_URL, sha256sum: 'foo' });
    deviceApi.getInfo.mockResolvedValue({ otaUnlock: false });

    const { getByRole } = render(<FlashDialog isOpen={true} deviceApi={deviceApi} />);
    await doFlash({ getByRole });

    expect(deviceApi.flashOta.mock.calls.length).toBe(0);
});

it('should display failed to unlock message when clicking the flash button if the device could not be unlocked', async () => {
    deviceApi.verifyOtaUrl.mockResolvedValue({ size: 500000, downloadUrl: VALID_URL, sha256sum: 'foo' });
    deviceApi.getInfo.mockResolvedValue({ otaUnlock: false });

    const { getByRole, getByText } = render(<FlashDialog isOpen={true} deviceApi={deviceApi} />);
    await doFlash({ getByRole });

    expect(getByText(/failed to unlock the device/i)).toBeVisible();
});

it('should flash the ota when clicking the flash button and the device is unlocked', async () => {
    deviceApi.verifyOtaUrl.mockResolvedValue({ size: 500000, downloadUrl: VALID_URL, sha256sum: 'foo' });
    deviceApi.getInfo.mockResolvedValueOnce({ otaUnlock: true });

    const { getByRole } = render(<FlashDialog isOpen={true} deviceApi={deviceApi} />);
    await doFlash({ getByRole });

    expect(deviceApi.flashOta.mock.calls.length).toBe(1);
});
