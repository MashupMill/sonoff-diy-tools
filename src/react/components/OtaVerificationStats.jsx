import React from 'react';
import PropTypes from 'prop-types';
import { Classes, Callout, Intent } from '@blueprintjs/core';
import styled from 'styled-components';

const StyledContainer = styled(Callout)`
    font-size: 80%;
`;

export default function OtaVerificationStats({ verifying, valid, size, sha256sum, error, downloadUrl }) {
    if (verifying !== false) return null;
    return (
        <StyledContainer intent={valid ? Intent.SUCCESS : Intent.DANGER} className={Classes.TEXT_DISABLED}>
            {error && <div>{error.toString()}</div>}
            {size && <div>Size: {size / 1000}kb</div>}
            {sha256sum && <div>SHA256 Checksum: {sha256sum}</div>}
            {downloadUrl && <div>Download URL: {downloadUrl}</div>}
        </StyledContainer>
    );
}

OtaVerificationStats.propTypes = {
    verifying: PropTypes.bool,
    valid: PropTypes.bool,
    size: PropTypes.number,
    sha256sum: PropTypes.string,
    error: PropTypes.any,
    downloadUrl: PropTypes.string,
}
