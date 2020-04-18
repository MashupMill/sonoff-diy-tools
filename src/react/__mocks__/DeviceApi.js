export const deviceApi = {
    doRequest: jest.fn(),
    getInfo: jest.fn(),
    switch: jest.fn(),
    setPowerOnState: jest.fn(),
    getSignalStrength: jest.fn(),
    setInching: jest.fn(),
    setWifi: jest.fn(),
    setOtaUnlock: jest.fn(),
    flashOta: jest.fn(),
    verifyOtaUrl: jest.fn(),
}
export default jest.fn().mockImplementation(() => (deviceApi));
