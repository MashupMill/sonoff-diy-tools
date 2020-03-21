import React, { Component } from 'react';
import { Alignment, Navbar, NonIdealState } from '@blueprintjs/core';
import './App.css';
import { channels } from '../electron/constants';
import DeviceResult from './components/DeviceResult';
const { ipcRenderer } = window;

class App extends Component {

  state = {
    appName: '',
    appVersion: '',
    nodeVersion: '',
    chromeVersion: '',
    electronVersion: '',
    devices: {}
  }

  componentDidMount() {
    ipcRenderer.once(channels.APP_INFO, (event, arg) => {
      const { appName, appVersion, nodeVersion, chromeVersion, electronVersion } = arg;
      this.setState({ appName, appVersion, nodeVersion, chromeVersion, electronVersion });
    });
    ipcRenderer.send(channels.APP_INFO);

    ipcRenderer.on(channels.DEVICE_RESPONSE, (event, device) => {
      if (JSON.stringify(device) !== JSON.stringify(this.state.devices[device.fqdn])) {
        this.setState({ devices: {...this.state.devices, [device.fqdn]: device} });
      }
    });
    ipcRenderer.send(channels.SCAN_DEVICES);
  }

  render() {
    const { appName, appVersion } = this.state;
    const devices = Object.values(this.state.devices);
    return (
      <div>
        <Navbar>
          <Navbar.Group align={Alignment.LEFT}>
            <Navbar.Heading>{appName} <small>v{appVersion}</small></Navbar.Heading>
          </Navbar.Group>
          <Navbar.Group align={Alignment.RIGHT}>
            {/* <Button icon={'flash' || 'moon'} minimal /> */}
          </Navbar.Group>
        </Navbar>
        <div>
          {devices && devices.length > 0 ? devices.map(device => (
            <DeviceResult key={`device-result-${device.fqdn}`} device={device} />
          )) : (
            <NonIdealState icon="offline"
                           title="No devices found"
                           description="Could not find any devices on your network. Please ensure they are on and connected to the same wifi as your computer."
            />
          )}
        </div>
      </div>
    );
  }
}

export default App;
