import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FormGroup, Label, Switch, HTMLSelect as Select, NumericInput, Classes, Divider, H6, Callout } from '@blueprintjs/core';
import styled from 'styled-components';
import WifiSettings from './WifiSettings';

const PULSE_WIDTH_MIN = 500;
const PULSE_WIDTH_MAX = 36000000;
const PULSE_WIDTH_STEP = 500;

const StyledContainer = styled(Callout)`
    margin-top: 1em;

    .${Classes.FORM_GROUP} > .${Classes.LABEL} {
        font-weight: bold;
    }

    .${Classes.DIVIDER} {
        margin-left: 0;
        margin-right: 0;
    }
`

export default function DeviceConfiguration({ settings = {}, onChange, deviceApi }) {
    const [pulseWidth, setPulseWidth] = useState(settings.pulseWidth);
    // if (settings.pulseWidth && settings.pulseWidth != pulseWidth) {
    //     setPulseWidth(settings.pulseWidth);
    // }
    return (
        <StyledContainer>
            <H6>Device Configuration</H6>
            <Divider />
            <WifiSettings initialSsid={settings.ssid} deviceApi={deviceApi} />

            <FormGroup label="Power On State">
                <Select value={settings.startup} onChange={e => onChange({ ...settings, startup: e.target.value })}>
                    <option value="off">Off</option>
                    <option value="on">On</option>
                    <option value="stay">Stay</option>
                </Select>
            </FormGroup>

            <FormGroup label="Pulse / Inching Settings">
                <Label>
                    <Switch label="Enabled" checked={settings.pulse === 'on'} onChange={(e) => onChange({ ...settings, pulse: e.target.checked ? 'on' : 'off' })} />
                </Label>
                <Label>
                    Pulse Width (milliseconds)
                <NumericInput value={pulseWidth}
                              leftIcon="time"
                              min={PULSE_WIDTH_MIN}
                              max={PULSE_WIDTH_MAX}
                              stepSize={500}
                              minorStepSize={500}
                              majorStepSize={10000}
                              onValueChange={value => {
                            setPulseWidth(value);
                            if (value % PULSE_WIDTH_STEP === 0) {
                                onChange({ ...settings, pulseWidth: value })
                            }
                        }} />
                </Label>
            </FormGroup>
        </StyledContainer>
    )
}

DeviceConfiguration.propTypes = {
    settings: PropTypes.shape({
        ssid: PropTypes.string,
        pulse: PropTypes.oneOf(['on', 'off']),
        // TOOD: rest
    }),
    onChange: PropTypes.func,
    deviceApi: PropTypes.object,
}
