import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Icon, Button, Intent, InputGroup, Classes, FormGroup } from '@blueprintjs/core';
import WifiSaveConfirmDialog from './WifiSaveConfirmDialog';

const StyledInputGroup = styled(InputGroup)`
    &:not(:last-child) {
        margin-bottom: 5px;
    }
`;

const SaveActions = styled.div`
    margin-bottom: 15px;
`;

export default function WifiSettings({ initialSsid, deviceApi }) {
    const [isEditing, setEditing] = useState(false);
    const [showPassword, setShowPassword] = useState(true);
    const [showConfirm, setShowConfirm] = useState(false);
    const [ssid, setSsid] = useState(initialSsid);
    const [password, setPassword] = useState('');

    if (!ssid && initialSsid) {
        setSsid(initialSsid);
    }

    if (!ssid) return null;

    const handleSubmit = (e) => {
        console.log('submit');
        e.preventDefault();
        setShowConfirm(true);
        return false;
    }

    const handleCancel = () => {
        setEditing(false);
        setSsid(initialSsid);
        setPassword('');
    }

    const handleSave = () => {
        deviceApi.setWifi({ ssid, password });
        setEditing(false);
        setShowConfirm(false);
    }

    if (!isEditing) {
        return (
            <FormGroup label="Wifi Network">
                {ssid} <Button minimal onClick={() => setEditing(true)}><Icon icon="edit" /></Button>
            </FormGroup>
        )
    }

    return (
        <form onSubmit={handleSubmit}>
            <FormGroup label="Wifi Network">
                <StyledInputGroup autoFocus
                                  placeholder="SSID"
                                  value={ssid}
                                  onChange={e => setSsid(`${e.target.value || ''}`.trim())}
                />
                <StyledInputGroup leftIcon="lock"
                                  type={showPassword ? 'text' : 'password'}
                                  placeholder="Password"
                                  rightElement={<Button onClick={() => setShowPassword(!showPassword)} minimal><Icon icon={showPassword ? 'eye-open' : 'eye-off'} /></Button>}
                                  value={password}
                                  onChange={e => setPassword(`${e.target.value || ''}`.trim())}
                />
            </FormGroup>

            <SaveActions className={Classes.DIALOG_FOOTER_ACTIONS}>
                <Button small onClick={handleCancel}>Cancel</Button>
                <Button small disabled={!password} intent={Intent.PRIMARY} type="submit" onClick={handleSubmit}>Save</Button>
            </SaveActions>

            <WifiSaveConfirmDialog ssid={ssid}
                                   password={password}
                                   isOpen={showConfirm}
                                   onClose={() => setShowConfirm(false)}
                                   onSave={handleSave} />
        </form>
    )
}

WifiSettings.propTypes = {
    initialSsid: PropTypes.string,
    deviceApi: PropTypes.object,
}
