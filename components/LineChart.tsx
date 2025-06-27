import { Skia, Canvas, Path, Text, matchFont } from "@shopify/react-native-skia";
import { useWindowDimensions, Platform } from "react-native";
import { useMemo } from "react";
import { scaleLinear } from "d3";

export interface DataPoint {
    forceKg: number;
    timestamp: number;
}

interface LineChartProps {
    weights: number[];
    timestamps: number[];
    isConnected: boolean;
}

export default function LineChart ({weights, timestamps, isConnected} : LineChartProps) {
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
        const y = scales.y(weights[0]);
        path.moveTo(x, y);
        
        // Draw lines to all subsequent points
        for(let i = 1; i < timestamps.length; i++) {
            const x = scales.x(timestamps[i]);
            const y = scales.y(weights[i]);
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
                color={isConnected ? "blue" : "gray"} 
                style="stroke" 
                strokeWidth={2}
            />
        </Canvas>
    );
}