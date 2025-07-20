import React, { createContext, useContext, ReactNode } from 'react';
import useBLE from '@/hooks/useBLE';
import { Device } from 'react-native-ble-plx';

interface BLEContextType {
    requestPermissions: () => Promise<boolean>;
    scanForDevices: () => void;
    isScanningForDevices: boolean;
    connectToDevice: (device: Device) => Promise<void>;
    disconnectFromDevice: () => void;
    tareConnectedDevice: () => void;
    connectedDevice: Device | null;
    allDevices: Device[];
    weightPacket: number[];
    timestampPacket: number[];
}

  const BLEContext = createContext<BLEContextType | undefined>(undefined);

export function BLEProvider({ children }: { children: ReactNode }) {
    const bleData = useBLE()

    return(
        <BLEContext.Provider value={bleData}>
            {children}
        </BLEContext.Provider>
    );
}

export function useBLEContext() {
    const context = useContext(BLEContext);
    if (context === undefined) {
      throw new Error('useBLEContext must be used within a BLEProvider');
    }
    return context;
  } 
