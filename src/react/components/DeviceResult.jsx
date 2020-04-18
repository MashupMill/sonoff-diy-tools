import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, Card, Collapse, Elevation, H5, Switch, Intent, } from '@blueprintjs/core';
import styled from 'styled-components';
import DeviceApi from '../DeviceApi';
import DeviceConfiguration from './DeviceConfiguration';
import FlashDialog from './FlashDialog';

const StyledCard = styled(Card)`
    margin: 1em;
`

const CardHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;

    && > * {
        margin-bottom: 0;
    }
`;

const CardHeaderGroup = styled(CardHeader)`
    & > *:not(:first-child) {
        margin-left: 10px;
    }
`;

export default function DeviceResult({ device }) {
    const [ showSettings, setShowSettings ] = useState(false);
    const [ showFlash, setShowFlash ] = useState(false);
    const [ settings, setSettings ] = useState({});
    const deviceApi = new DeviceApi({ id: device.txt.id, addresses: device.addresses, port: device.port })
    const loadSettings = () => {deviceApi.getInfo().then((data) => setSettings(data))};
    useEffect(loadSettings, [ device.txt.id, device.addresses, device.port ])

    const handleConfigChange = async ({ startup, pulse, pulseWidth }) => {
        const saves = [];
        if (startup !== settings.startup) {
            saves.push(deviceApi.setPowerOnState(startup));
        }
        if (pulse !== settings.pulse || pulseWidth !== settings.pulseWidth) {
            saves.push(deviceApi.setInching({ pulse, pulseWidth }));
        }
        setSettings({ ...settings, startup, pulse, pulseWidth });
        await Promise.all(saves);
        await loadSettings();
    }

    return (
        <StyledCard elevation={Elevation.ZERO}>
            <CardHeader>
                <CardHeaderGroup>
                <H5>
                    {device.name}{' '}
                    <small>{device.addresses.join(', ')}</small>
                </H5>
                <Switch disabled={!settings.switch}
                        checked={settings.switch === 'on'}
                        innerLabel="off"
                        innerLabelChecked="on"
                        aria-label={settings.switch === 'on' ? 'Turn Off' : 'Turn On'}
                        onChange={async (e) => {
                            await deviceApi.switch(e.target.checked);
                            await loadSettings();
                        }} />
                </CardHeaderGroup>
                <CardHeaderGroup>
                    <Button disabled={!settings.switch} onClick={() => setShowFlash(!showFlash)}>Flash</Button>
                    <Button disabled={!settings.switch} minimal icon="cog" intent={showSettings ? Intent.PRIMARY : undefined} onClick={() => setShowSettings(!showSettings)} aria-label={showSettings ? 'Hide Settings' : 'Show Settings'} />
                </CardHeaderGroup>
            </CardHeader>
            <Collapse isOpen={showSettings}>
                {Object.keys(settings).length && <DeviceConfiguration settings={settings} onChange={handleConfigChange} deviceApi={deviceApi} />}
            </Collapse>
            <FlashDialog isOpen={showFlash}
                         deviceApi={deviceApi}
                         onClose={() => setShowFlash(false)} />
        </StyledCard>
    )
}

DeviceResult.propTypes = {
    device: PropTypes.shape({
        name: PropTypes.string,
        addresses: PropTypes.arrayOf(PropTypes.string),
        port: PropTypes.number,
        txt: PropTypes.shape({
            id: PropTypes.string,
        })
    })
};
