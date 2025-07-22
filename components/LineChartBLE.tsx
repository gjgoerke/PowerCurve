import { useState, useEffect } from "react";

import LineChart from "./LineChart";
import { TrainingParams } from "@/types/types";
import { useBLEContext } from "@/context/BLEContext";

interface LineChartBLEProps {
    trainingParams?: TrainingParams;
}


export default function LineChartBLE ({trainingParams} : LineChartBLEProps) {
    /*
    * BLE Stuff
    */
        const {
            requestPermissions,
            scanForDevices,
            isScanningForDevices,
            allDevices,
            connectToDevice,
            connectedDevice,
            weightPacket,
            timestampPacket,
            tareConnectedDevice,
        } = useBLEContext();
    
        const [weights, setWeights] = useState<number[]>([]);
        const [timestamps, setTimestamps] = useState<number[]>([]);
      
        useEffect(() => {
          setWeights([...weights, ...weightPacket].slice(-150));
          setTimestamps([...timestamps, ...timestampPacket].slice(-150));
        }, [timestampPacket])

        return(
            <LineChart trainingParams={trainingParams} weights={weights} timestamps={timestamps}/>
        )
}