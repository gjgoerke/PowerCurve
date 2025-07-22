import { Skia, Canvas, Path, Text, matchFont, Rect } from "@shopify/react-native-skia";
import { useWindowDimensions, Platform } from "react-native";
import { useMemo, useEffect, useState } from "react";
import { scaleLinear } from "d3";

import { useBLEContext } from "@/context/BLEContext";
import { TrainingParams } from "@/types/types";
import { useTheme } from "react-native-paper";

interface LineChartProps {
    trainingParams?: TrainingParams;
    weights: number[];
    timestamps: number[];
}

export default function LineChart ({trainingParams, weights, timestamps} : LineChartProps) {

    // Paper Theme
    const theme = useTheme();

    /*
    *   Chart Dimensions
    */
    const { height, width } = useWindowDimensions()
    const chartHeight = 450;
    const chartWidth = width;

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
        const yModifier = trainingParams ? trainingParams.trainingLoad + trainingParams.trainingLoadTolerance : 0;
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

    /*
    *   
    */

    return (
        <Canvas style = {{width: chartWidth, height: chartHeight}}>
            {
                trainingParams && 
                <Rect
                    x={0} 
                    y={scales.y(17)} 
                    height={scales.y(5)} 
                    width={width} 
                    color={theme.colors.primaryContainer}
                />
            }
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
                color={theme.colors.primary} 
                style="stroke" 
                strokeWidth={2}
            />
        </Canvas>
    );
}