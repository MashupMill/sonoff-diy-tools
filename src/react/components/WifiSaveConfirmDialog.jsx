import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { Button, Intent, Dialog, H5, Classes, Callout } from '@blueprintjs/core';

export default function WifiSaveConfirmDialog({ ssid, password, isOpen, onClose, onSave }) {
    const primaryAction = useRef();
    return (
        <Dialog icon="warning-sign"
                isOpen={isOpen}
                onClose={onClose}
                title="Please double check!"
                onOpened={() => console.log(primaryAction.current)}>
            <div className={`${Classes.DIALOG_BODY} ${Classes.RUNNING_TEXT}`}>
                <Callout intent={Intent.WARNING}>
                    Please double check these settings are correct!
                    Once these are saved, the device will disconnect from the
                    current wifi network and attempt to connect to the network
                    shown here.
                </Callout>
                <H5>
                    <p>SSID: <code>{ssid}</code></p>
                    <p>Password: <code>{password}</code></p>
                </H5>
            </div>
            <div className={`${Classes.DIALOG_FOOTER} ${Classes.DIALOG_FOOTER_ACTIONS}`}>
                <Button onClick={onClose}>Cancel</Button>
                <Button elementRef={primaryAction} intent={Intent.PRIMARY} onClick={onSave}>Save Wifi Settings</Button>
            </div>
        </Dialog>
    )
}

WifiSaveConfirmDialog.propTypes = {
    ssid: PropTypes.string,
    password: PropTypes.string,
    isOpen: PropTypes.bool,
    onClose: PropTypes.func,
    onSave: PropTypes.func,
}
