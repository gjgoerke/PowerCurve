import { Canvas } from "@shopify/react-native-skia";
import { useWindowDimensions } from "react-native";

interface lineChartProps {

}

export default function LineChart ({} : lineChartProps) {
    const {width} = useWindowDimensions()
    const chartWidth = width;
    const chartHeight = 350;
    return (
        <Canvas style = {{width: chartWidth, height: chartHeight, backgroundColor: 'red'}}>
            
        </Canvas>
    );
}