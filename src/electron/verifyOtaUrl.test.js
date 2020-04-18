/**
 * @jest-environment node
 */
const nock = require('nock');
const { dir } = require('tmp-promise');
const verifyOtaUrl = require('./verifyOtaUrl');

beforeAll(() => {
    nock('http://localhost')
        .persist()
        .get('/firmware-foobar.bin').reply(200, 'foobar')
        .get('/404.bin').reply(404);
});
it('should resolve with the size of the file', async () => {
    const firmwareDir = await dir();
    const verification = await verifyOtaUrl('http://localhost/firmware-foobar.bin', firmwareDir.path);
    expect(verification.size).toEqual(6);
});

it('should create a sha256 hash of the file', async () => {
    const firmwareDir = await dir();
    const verification = await verifyOtaUrl('http://localhost/firmware-foobar.bin', firmwareDir.path);
    expect(verification.sha256sum).toEqual('c3ab8ff13720e8ad9047dd39466b3c8974e592c2fa383d4a3960714caef0c4f2');
});

it('should throw an error if we get an http error code fetching firmware', async () => {
    try {
        const firmwareDir = await dir();
        await verifyOtaUrl('http://localhost/404.bin', firmwareDir.path);
    } catch (error) {
        expect(error.toString()).toContain('non-success status code');
        return;
    }
    expect.fail('error should have been thrown');
});
