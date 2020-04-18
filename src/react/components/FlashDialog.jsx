import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useDebouncedCallback } from 'use-debounce';
import { Classes, Dialog, Button, Intent, InputGroup, FormGroup, Callout } from '@blueprintjs/core';
import OtaVerificationStats from './OtaVerificationStats';

const MAX_SIZE = 508000;

export default function FlashDialog({ isOpen, onClose, deviceApi }) {
    const [ url, setUrl ] = useState('');
    const [ verification, setVerification ] = useState({});
    const [ flashing, setFlashing ] = useState(false);
    const [ flashStage, setFlashStage ] = useState(null);

    const [doVerification] = useDebouncedCallback(
        async () => {
            setVerification({ ...verification, valid: false, verifying: true, error: null });
            try {
                const newVerification = await deviceApi.verifyOtaUrl({ url });
                let error = null;
                if (newVerification.size > MAX_SIZE) {
                    error = new Error(`The file size (${newVerification.size / 1000}kb) is greater than the max file size (${MAX_SIZE / 1000}kb)`);
                }
                setVerification({
                    ...newVerification,
                    valid: newVerification.size < MAX_SIZE,
                    verifying: false,
                    error,
                });
            } catch (error) {
                setVerification({
                    verifying: false,
                    valid: false,
                    error: error,
                })
            }
        }
    , 500)


    const onSave = async (e) => {
        e.preventDefault();
        setFlashing(true);
        const info = await deviceApi.getInfo();
        if (info.otaUnlock === false) {
            setFlashStage('Unlocking');
            await deviceApi.setOtaUnlock();
            if (!(await deviceApi.getInfo()).otaUnlock) {
                setVerification({ ...verification, valid: false, error: new Error('Failed to unlock the device. Please make sure the device is on a network connected to the internet') })
                setFlashStage(null);
                setFlashing(false);
                return false;
            }
        }
        setFlashStage('Sending Url');
        await deviceApi.flashOta({ downloadUrl: verification.downloadUrl, sha256sum: verification.sha256sum });
        setFlashStage('Sent');
        setFlashing(false);
    };

    const handleChange = async (e) => {
        setUrl(e.target.value);
        doVerification();
    }

    return (
        <Dialog isOpen={isOpen} onClose={onClose} title="Flash OTA File">
            <form onSubmit={onSave}>
                <div className={`${Classes.DIALOG_BODY} ${Classes.RUNNING_TEXT}`}>
                    <Callout intent={Intent.WARNING}>
                        Flashing a DIY firmware will void your warranty. By clicking &quot;Flash&quot;, you accept voiding the warranty on this device.
                        To avoid bricking, do not power off, restart the device, disconnect it from the network, restart the router, etc.
                    </Callout>
                    <p>
                        Enter the url to the firmware file. <strong>The file must be less that {MAX_SIZE / 1000}kb.</strong>
                    </p>
                    <FormGroup label="Firmware URL">
                        <InputGroup type="url" value={url} onChange={handleChange} placeholder="http://example.com/tasmota-lite.bin" />
                    </FormGroup>
                    <OtaVerificationStats url={url} {...verification}/>
                </div>
                <div className={`${Classes.DIALOG_FOOTER} ${Classes.DIALOG_FOOTER_ACTIONS}`}>
                    <Button onClick={onClose} disabled={flashing}>Cancel</Button>
                    <Button disabled={verification.valid !== true || flashing || flashStage}
                            loading={verification.verifying}
                            intent={Intent.PRIMARY}
                            type="submit"
                    >
                        {flashStage ? flashStage : 'Flash'}
                    </Button>
                </div>
            </form>
        </Dialog>
    );
}

FlashDialog.propTypes = {
    isOpen: PropTypes.bool,
    onClose: PropTypes.func,
    deviceApi: PropTypes.shape({
        verifyOtaUrl: PropTypes.func,
        getInfo: PropTypes.func,
        setOtaUnlock: PropTypes.func,
        flashOta: PropTypes.func,
    })
}
