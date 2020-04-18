import React from 'react'
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Classes } from '@blueprintjs/core';
import OtaVerificationStats from './OtaVerificationStats';

it('should display error when given', () => {
    const error = new Error('yea...it failed');
    const { getByText } = render(<OtaVerificationStats verifying={false} error={error} />);
    expect(getByText(error.toString())).toBeVisible();
});
it('should display size when given', () => {
    const { getByText } = render(<OtaVerificationStats verifying={false} size={1100} />);
    expect(getByText('1.1kb', { exact: false })).toBeVisible();
});
it('should display sha256 checksum when given', () => {
    const { getByText } = render(<OtaVerificationStats verifying={false} sha256sum="abc" />);
    expect(getByText('abc', { exact: false })).toBeVisible();
});
it('should display download url when given', () => {
    const { getByText } = render(<OtaVerificationStats verifying={false} downloadUrl="abc" />);
    expect(getByText('abc', { exact: false })).toBeVisible();
});
it('should render nothing if verifying is null', () => {
    const { container } = render(<OtaVerificationStats verifying={null} />);
    expect(container).toBeEmpty();
});
it('should render nothing if verifying is true', () => {
    const { container } = render(<OtaVerificationStats verifying={true} />);
    expect(container).toBeEmpty();
});
it('should display with an error intent by default', () => {
    const { container } = render(<OtaVerificationStats verifying={false} />);
    expect(container.childNodes[0]).toHaveClass(Classes.INTENT_DANGER);
});
it('should display with an success intent when valid', () => {
    const { container } = render(<OtaVerificationStats verifying={false} valid />);
    expect(container.childNodes[0]).toHaveClass(Classes.INTENT_SUCCESS);
});
