import { useMemo, useState } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import {
  BleError,
  BleManager,
  Characteristic,
  Device,
} from "react-native-ble-plx";
import base64 from "react-native-base64";

const response_codes = {"cmd_resp": 0, "weight_measure": 1, "low_pwr": 4};
const commands = {
    "TARE_SCALE" : 0x64,
    "START_WEIGHT_MEAS" : 0x65,
    "STOP_WEIGHT_MEAS" : 0x66,
    "START_PEAK_RFD_MEAS" : 0x67,
    "START_PEAK_RFD_MEAS_SERIES" : 0x68,
    "ADD_CALIB_POINT" : 0x69,
    "SAVE_CALIB" : 0x6A,
    "GET_APP_VERSION" : 0x6B,
    "GET_ERR_INFO" : 0x6C,
    "CLR_ERR_INFO" : 0x6D,
    "SLEEP" : 0x6E,
    "GET_BATT_VLTG" : 0x6F,
}
const service_uuid = "7e4e1701-1ea6-40c9-9dcc-13d34ffead57";
const write_uuid = "7e4e1703-1ea6-40c9-9dcc-13d34ffead57";
const notify_uuid = "7e4e1702-1ea6-40c9-9dcc-13d34ffead57";

interface BluetoothLowEnergyApi {
    requestPermissions(): Promise<boolean>;
    scanForDevices(): void;
    isScanningForDevices: boolean;
    connectToDevice: (deviceId: Device) => Promise<void>;
    disconnectFromDevice: () => void;
    tareConnectedDevice: () => void;
    connectedDevice: Device | null;
    allDevices: Device[];
    weightPacket: number[];
    timestampPacket: number[];
  }
  
function useBLE(): BluetoothLowEnergyApi {
    const bleManager = useMemo(() => new BleManager(), []);
    const [allDevices, setAllDevices] = useState<Device[]>([]);
    const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
    const [weightPacket, setWeightPacket] = useState<number[]>(new Array(15).fill(0)); // In kilograms
    const [timestampPacket, setTimestampPacket] = useState<number[]>(new Array(15).fill(0)); // In seconds
    const [monitoringSubscription, setMonitoringSubscription] = useState<any>(null);
    const [isScanningForDevices, setIsScanningForDevices] = useState<boolean>(false);
  
    const requestAndroid31Permissions = async () => {
        const bluetoothScanPermission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          {
            title: "Location Permission",
            message: "Bluetooth Low Energy requires Location",
            buttonPositive: "OK",
          }
        );
        const bluetoothConnectPermission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          {
            title: "Location Permission",
            message: "Bluetooth Low Energy requires Location",
            buttonPositive: "OK",
          }
        );
        const fineLocationPermission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Location Permission",
            message: "Bluetooth Low Energy requires Location",
            buttonPositive: "OK",
          }
        );
    
        return (
          bluetoothScanPermission === "granted" &&
          bluetoothConnectPermission === "granted" &&
          fineLocationPermission === "granted"
        );
      };
    
      const requestPermissions = async () => {
        if (Platform.OS === "android") {
          if (Platform.Version < 31) {
            const granted = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
              {
                title: "Location Permission",
                message: "Bluetooth Low Energy requires Location",
                buttonPositive: "OK",
              }
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
          } else {
            const isAndroid31PermissionsGranted =
              await requestAndroid31Permissions();
    
            return isAndroid31PermissionsGranted;
          }
        } else {
          return true;
        }
    };

    const isDuplicateDevice = (devices: Device[], nextDevice: Device) =>
        devices.findIndex((device) => nextDevice.id === device.id) > -1;
    
    const scanForPeripherals = () =>{
      setIsScanningForDevices(true);
      bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
          console.log(error);
      }
      if (device && device.name?.includes("Progressor")) {
          setAllDevices((prevState: Device[]) => {
          if (!isDuplicateDevice(prevState, device)) {
              return [...prevState, device];
          }
          return prevState;
          });
      }
    });
    setTimeout(()=>{
      bleManager.stopDeviceScan();
      setIsScanningForDevices(false);
    }, 20000);
    console.log('scanningForDevices := false')
  }

    const scanForDevices = async () => {
      const isPermissionsEnabled = await requestPermissions();
      if (isPermissionsEnabled) {
        scanForPeripherals();
      }
    };

    const connectToDevice = async (device: Device) => {
      if(isScanningForDevices) {
        bleManager.stopDeviceScan();
        setIsScanningForDevices(false);
      }
        try {
            const deviceConnection = await bleManager.connectToDevice(device.id);
            setConnectedDevice(deviceConnection);
            await deviceConnection.discoverAllServicesAndCharacteristics();
            bleManager.stopDeviceScan();
            setTimeout(() => {startStreamingData(deviceConnection)}, 100);
        } catch (e) {
            console.log("FAILED TO CONNECT", e);
        }
    };
        
    const disconnectFromDevice = () => {
        if (connectedDevice) {
            // Stop monitoring
            if (monitoringSubscription) {
                monitoringSubscription.remove();
                setMonitoringSubscription(null);
            }
            
            bleManager.cancelDeviceConnection(connectedDevice.id);
            setConnectedDevice(null);
            setWeightPacket(new Array(15).fill(0));
            setTimestampPacket(new Array(15).fill(0));
        }
    };

    const onWeightUpdate = (error: BleError | null, characteristic: Characteristic | null) => {
        console.log("onWeightUpdate called at:", new Date().toISOString());
        console.log("Error:", error);
        console.log("Characteristic:", characteristic?.uuid);
        console.log("Has value:", !!characteristic?.value);
        
        if (error) {
          console.log("BLE Error in onWeightUpdate:", error);
          return -1;
        } else if (!characteristic?.value) {
          console.log("No Data was received in onWeightUpdate");
          return -1;
        }
    
        const rawData = base64.decode(characteristic.value);
        console.log("Raw data received:", rawData);
        console.log("Raw data length:", rawData.length);
        console.log("Raw data bytes:", Array.from(rawData).map(c => c.charCodeAt(0)));
        
        // Format: [response_code][length][value][response_code][length][value]...
        // Each measurement starts with response code (1 byte) + length (1 byte) + value (n bytes)
        
        let currentIndex = 0;
        let lastWeight = -1;
        let lastTime = 0;
        const weightPacketArray = new Array(15).fill(0);
        const timestampPacketArray = new Array(15).fill(0);
        
        while (currentIndex < rawData.length - 2) { // Need at least 2 bytes for response + length
            const responseCode = rawData[currentIndex].charCodeAt(0);
            const length = rawData[currentIndex + 1].charCodeAt(0);
            
            console.log(`Measurement at index ${currentIndex}: response=${responseCode}, length=${length}`);
            
            if (responseCode === 0x01 && currentIndex + 2 + length <= rawData.length) {
                // This is a weight measurement (weight + timestamp).
                const valueBytes = [];
                for (let i = 0; i < length; i++) {
                valueBytes.push(rawData[currentIndex + 2 + i].charCodeAt(0));
            }
            
            console.log("Weight measurement bytes:", valueBytes);
            
            // If length is 120, it contains multiple 8-byte measurements
            // Parse each 8-byte measurement within the value
            // Format: struct.unpack("<fl") - 4 bytes float + 4 bytes long (microseconds)
            const numMeasurements = length / 8; // 15 measurements
            console.log(`Parsing ${numMeasurements} individual measurements`);

            for (let i = 0; i < numMeasurements; i++) {
                const measurementStart = i * 8;
                const weightBytes = valueBytes.slice(measurementStart, measurementStart + 4);
                const timestampBytes = valueBytes.slice(measurementStart + 4, measurementStart + 8);
                
                // Parse weight as 32-bit float (little-endian)
                const buffer = new ArrayBuffer(4);
                const view = new DataView(buffer);
                view.setUint8(0, weightBytes[0]);
                view.setUint8(1, weightBytes[1]);
                view.setUint8(2, weightBytes[2]);
                view.setUint8(3, weightBytes[3]);
                const weight = view.getFloat32(0, true); // little-endian
                weightPacketArray[i] = weight;
                // Parse timestamp as 32-bit integer (microseconds, little-endian)
                const timestamp = (timestampBytes[3] << 24) | (timestampBytes[2] << 16) | (timestampBytes[1] << 8) | timestampBytes[0];
                const timeSeconds = timestamp / 1.0e6; // Convert microseconds to seconds
                timestampPacketArray[i] = timeSeconds;


                console.log(`Measurement ${i + 1}: time=${timeSeconds}s, weight=${weight}`);
                lastWeight = weight;
                lastTime = timeSeconds;
            }

        }
          // Move to next measurement
          currentIndex += 2 + length;
        }
        if (lastWeight !== -1) {
          console.log("lastTime", lastTime);
          setWeightPacket(weightPacketArray);
          setTimestampPacket(timestampPacketArray);
        }
      };
    
    const startStreamingData = async (device: Device, retryCount = 0) => {
        if (device) {
            try {
                // Send command to start weight measurement
                const command = new Uint8Array([commands['START_WEIGHT_MEAS']]);
                await device.writeCharacteristicWithResponseForService(
                    service_uuid, 
                    write_uuid, 
                    base64.encode(String.fromCharCode(...command))
                );
                
                console.log("Weight measurement started");
                
                // Start monitoring for data (automatically enables notifications)
                const subscription = device.monitorCharacteristicForService(
                    service_uuid,
                    notify_uuid,
                    onWeightUpdate
                );
                
                setMonitoringSubscription(subscription);
                console.log("Started monitoring weight data");
                
            } catch (error) {
                console.log("Error in startStreamingData:", error);
                if (retryCount < 5) {
                  console.log('Trying to connect to device. Attempt ' + (retryCount + 1) + ' out of 5.')
                  setTimeout(() => {
                    startStreamingData(device, retryCount + 1);
                  }, 200 * (retryCount + 1));
                }

            }
        } else {
            console.log("No Device Connected");
        }
    };

    const tareConnectedDevice = async () => {
        if (connectedDevice) {
            try {
                console.log("Sending tare command...");
                const command = new Uint8Array([commands['TARE_SCALE']]);
                await connectedDevice.writeCharacteristicWithResponseForService(
                    service_uuid, 
                    write_uuid, 
                    base64.encode(String.fromCharCode(...command))
                );
                console.log("Tare");
                setTimeout(() => {startStreamingData(connectedDevice)}, 100)                
            } catch (error) {
                console.log("Error sending tare command:", error);
            }
        } else {
            console.log("No device connected to tare");
        }
    };

    return {
        requestPermissions,
        scanForDevices,
        isScanningForDevices,
        connectToDevice,
        disconnectFromDevice,
        tareConnectedDevice,
        connectedDevice,
        allDevices,
        weightPacket,
        timestampPacket
    };
    
}

export default useBLE;