import { channels } from './ipc';

it('should expose the channels', () => {
    expect(channels.APP_INFO).toBeTruthy();
});

