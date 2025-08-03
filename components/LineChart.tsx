import { Skia, Canvas, Path, Text, matchFont, Rect } from "@shopify/react-native-skia";
import { useWindowDimensions, Platform, StyleSheet } from "react-native";
import { useMemo, useState, useEffect} from "react";
import { color, scaleLinear } from "d3";

import { TrainingParams } from "@/types/types";
import { useTheme } from "react-native-paper";

interface LineChartProps {
    trainingParams: TrainingParams;
    weightPacket: number[];
    timestampPacket: number[];
    height: number;
    marginTop: number;
}

export default function LineChart ({trainingParams, weightPacket, timestampPacket, height, marginTop} : LineChartProps) {
    const [weights, setWeights] = useState<number[]>([]);
    const [timestamps, setTimestamps] = useState<number[]>([]);
    
    useEffect(() => {
        setWeights([...weights, ...weightPacket].slice(-150));
        setTimestamps([...timestamps, ...timestampPacket].slice(-150));
    }, [timestampPacket])

    // Paper Theme
    const theme = useTheme();

    // Styling
    const styles = useMemo(() => StyleSheet.create({
        axisText: {
            color: theme.colors.secondary,
            fontSize: 14,
        }
    }), [theme]);


    /*
    *   Chart Dimensions
    */
    const { width } = useWindowDimensions()
    const chartHeight = height;
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
        const yDomain = [0, Math.max(20, ...weights, trainingParams.trainingLoad + trainingParams.trainingLoadTolerance) + 10];
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
    const fontFamily = theme.fonts.default.fontFamily
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
        <Canvas style = {{width: chartWidth, height: chartHeight, marginTop: marginTop}}>
            {
                trainingParams && 
                <Rect
                    x={0} 
                    y={scales.y(trainingParams.trainingLoad + trainingParams.trainingLoadTolerance)} 
                    height={chartHeight - scales.y(trainingParams.trainingLoadTolerance)} 
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
                        color={theme.colors.secondary}
                    />
                ))
            }
            {/* {
                xTicks.map((value) => (
                    <Text
                        x={scales.x(value)}
                        y={chartHeight}
                        text={String(value)}
                        font={font}
                        key={value}
                        color={theme.colors.secondary}
                    />
                ))
            } */}
            <Path 
                path={path} 
                color={theme.colors.primary} 
                style="stroke" 
                strokeWidth={2}
            />
        </Canvas>
    );
}