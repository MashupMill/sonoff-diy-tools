import React from 'react'
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from "@testing-library/user-event";
import DeviceConfiguration from './DeviceConfiguration';

describe('power on state', () => {
    it('should display a select to configure power on state', () => {
        const { getByRole } = render(<DeviceConfiguration settings={{ startup: 'off' }} />);
        expect(getByRole('combobox', { name: 'Power On State' })).toBeVisible();
    });
    it('should select the option from the settings', () => {
        const { getByRole } = render(<DeviceConfiguration settings={{ startup: 'stay' }} />);
        expect(getByRole('combobox', { name: 'Power On State' })).toHaveValue('stay');
    });
    it('should trigger onChange with the selcted value', async () => {
        const onChange = jest.fn();
        const { getByRole } = render(<DeviceConfiguration settings={{ startup: 'off' }} onChange={onChange} />);
        userEvent.selectOptions(getByRole('combobox', { name: 'Power On State' }), 'on');
        expect(onChange.mock.calls.length).toBe(1);
        expect(onChange.mock.calls[0][0].startup).toEqual('on');
    });
    it('should include other setting values in the onChange', async () => {
        const onChange = jest.fn();
        const { getByRole } = render(<DeviceConfiguration settings={{ startup: 'off', foo: 'bar' }} onChange={onChange} />);
        userEvent.selectOptions(getByRole('combobox', { name: 'Power On State' }), 'on');
        expect(onChange.mock.calls[0][0].foo).toEqual('bar');
    });
});

describe('inching enabled', () => {
    it('should display a checkbox to configure whether inching is enabled', () => {
        const { getByRole } = render(<DeviceConfiguration settings={{ pulse: 'off' }} />);
        expect(getByRole('checkbox', { name: 'Inching Enabled' })).toBeVisible();
    });
    it('should check the checkbox when value is "on"', () => {
        const { getByRole } = render(<DeviceConfiguration settings={{ pulse: 'on' }} />);
        expect(getByRole('checkbox', { name: 'Inching Enabled' })).toBeChecked();
    });
    it('should NOT check the checkbox when value is "off"', () => {
        const { getByRole } = render(<DeviceConfiguration settings={{ pulse: 'off' }} />);
        expect(getByRole('checkbox', { name: 'Inching Enabled' })).not.toBeChecked();
    });
    it('should change pulse to "on" when toggling from "off"', () => {
        const onChange = jest.fn();
        const { getByRole } = render(<DeviceConfiguration settings={{ pulse: 'off' }} onChange={onChange} />);
        userEvent.click(getByRole('checkbox', { name: 'Inching Enabled' }));
        expect(onChange.mock.calls.length).toBe(1);
        expect(onChange.mock.calls[0][0].pulse).toEqual('on');
    });
    it('should change pulse to "off" when toggling from "on"', () => {
        const onChange = jest.fn();
        const { getByRole } = render(<DeviceConfiguration settings={{ pulse: 'on' }} onChange={onChange} />);
        userEvent.click(getByRole('checkbox', { name: 'Inching Enabled' }));
        expect(onChange.mock.calls.length).toBe(1);
        expect(onChange.mock.calls[0][0].pulse).toEqual('off');
    });
});

describe('inching pulse width', () => {
    it('should display a textbox to configure pulse width', () => {
        const { getByRole } = render(<DeviceConfiguration settings={{ pulseWidth: 500 }} />);
        expect(getByRole('textbox', { name: 'Pulse Width (milliseconds)' })).toBeVisible();
    });
    it('should set value to the value from settings', () => {
        const { getByRole } = render(<DeviceConfiguration settings={{ pulseWidth: 1000 }} />);
        expect(getByRole('textbox', { name: 'Pulse Width (milliseconds)' })).toHaveValue('1000');
    });
    it('should trigger onChange when the value is valid', async () => {
        const onChange = jest.fn();
        const { getByRole } = render(<DeviceConfiguration settings={{ pulseWidth: 500 }} onChange={onChange} />);
        const input = getByRole('textbox', { name: 'Pulse Width (milliseconds)' });
        await userEvent.type(input, '0');
        expect(onChange.mock.calls[0][0].pulseWidth).toBe(5000);
    });
    it('should NOT trigger onChange when the value is invalid', async () => {
        const onChange = jest.fn();
        const { getByRole } = render(<DeviceConfiguration settings={{ pulseWidth: 500 }} onChange={onChange} />);
        const input = getByRole('textbox', { name: 'Pulse Width (milliseconds)' });
        await userEvent.type(input, '1');
        expect(onChange.mock.calls.length).toBe(0);
    });
    // TODO: it should display error if value is invalid
});
