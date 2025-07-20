import { Skia, Canvas, Path, Text, matchFont } from "@shopify/react-native-skia";
import { useWindowDimensions, Platform } from "react-native";
import { useMemo, useEffect, useState } from "react";
import { scaleLinear } from "d3";

import { useBLEContext } from "@/context/BLEContext";

export interface DataPoint {
    forceKg: number;
    timestamp: number;
}

interface LineChartProps {

}

export default function LineChart ({} : LineChartProps) {

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


    const {width} = useWindowDimensions()
    const chartWidth = width;
    const chartHeight = 350;

    const scales = useMemo(() => {
        // Handle empty arrays
        if (!timestamps || timestamps.length === 0 || !weights || weights.length === 0) {
            return {
                x: scaleLinear().domain([0, 1]).range([0, chartWidth]),
                y: scaleLinear().domain([0, 1]).range([chartHeight, 0])
            };
        }
        
        // X-axis: timestamps → chart width
        const xDomain = [Math.min(...timestamps), Math.max(...timestamps)];
        const x = scaleLinear().domain(xDomain).range([0, chartWidth]);
        
        // Y-axis: forces → chart height (inverted for screen coordinates)
        const yDomain = [0, Math.max(...weights, 20)];
        const y = scaleLinear().domain(yDomain).range([chartHeight, 0]);
        return {x, y};
    }, [timestamps, weights, chartWidth, chartHeight]);

    const path = useMemo(() => {
        const path = Skia.Path.Make();
        
        // Handle empty arrays
        if (!timestamps || timestamps.length === 0 || !weights || weights.length === 0) {
            return path;
        }
        
        // Start the path at the first point
        const x = scales.x(timestamps[0]);
        const y = scales.y(Math.max(weights[0], 0)); // We don't want the line drawn below 0.
        path.moveTo(x, y);
        
        // Draw lines to all subsequent points
        for(let i = 1; i < timestamps.length; i++) {
            const x = scales.x(timestamps[i]);
            const y = scales.y(Math.max(weights[i], 0)); // We don't want the line drawn below 0.
            path.lineTo(x, y);  
        }
        
        return path;
    }, [timestamps, weights, scales]);

    // Y-Axis
    const fontFamily = Platform.select({ ios: "Helvetica", default: "serif" });
    const fontStyle = {
        fontFamily,
        fontSize: 14,
        fontStyle: "normal" as const,
        fontWeight: "normal" as const,
    };
    const font = matchFont(fontStyle);

    const yTicks = scales.y.ticks(10);

    // X-Axis
    const xTicks = scales.x.ticks(5);
    return (
        <Canvas style = {{width: chartWidth, height: chartHeight}}>
            {
                yTicks.map((value) => (
                    <Text
                        x={3}
                        y={scales.y(value) + fontStyle.fontSize}
                        text={String(value)}
                        font={font}
                        key={value}
                    />
                ))
            }
            {
                xTicks.map((value) => (
                    <Text
                        x={scales.x(value)}
                        y={chartHeight}
                        text={String(value)}
                        font={font}
                        key={value}
                    />
                ))
            }
            <Path 
                path={path} 
                color={connectedDevice? "blue" : "gray"} 
                style="stroke" 
                strokeWidth={2}
            />
        </Canvas>
    );
}