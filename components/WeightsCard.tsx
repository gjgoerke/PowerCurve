import { useEffect, useState, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Card, Text as PaperText } from 'react-native-paper';

import { useTheme } from 'react-native-paper';

interface WeightsCardProps {
    weights: number[];
}

export default function WeightsCard ({weights} : WeightsCardProps) {

    const theme = useTheme();
    const styles = useMemo(() => StyleSheet.create({
        container: {
            padding: 16,
            margin: 8,
            minHeight: 150, 
        },
        maxAvgContainer: {
            justifyContent: 'space-around',
            flexDirection: 'row'
        },
        maxAvgNumberText: {
            color: theme.colors.primary,
            fontSize: 44,
            fontWeight: 700
        },
        currentNumberText: {
            color: theme.colors.primary,
            fontSize: 56,
            fontWeight: 700
        },
        descriptorText: {
            color: theme.colors.secondary,
            fontSize: 14
        },
        descriptorNumberContainer: {
            alignItems: 'center'
        }
    }), [theme]);

    const [maxWeight, setMaxWeight] = useState<number>(0);
    const [avgWeight, setAvgWeight] = useState<number>(0);

    useEffect(() => {
        setMaxWeight(Math.max(maxWeight, ...weights));
    }, [weights]);
    const currentWeight = weights[weights.length - 1]; // Get the last weight instead of hardcoded index

    if(!currentWeight) {
        return null;
    }

    return(
        <View style={styles.container}>
            <View style={styles.maxAvgContainer}>
                <View style={styles.descriptorNumberContainer}>
                    <PaperText style={styles.descriptorText}>Max</PaperText>
                    <PaperText style={styles.maxAvgNumberText}>{maxWeight.toFixed(1)}</PaperText>
                </View>
                <View style={styles.descriptorNumberContainer}>
                    <PaperText style={styles.descriptorText}>Avg.</PaperText>
                    <PaperText style={styles.maxAvgNumberText}>{avgWeight.toFixed(1)}</PaperText>
                </View>
            </View>
            <View style={{alignSelf: 'center', ...styles.descriptorNumberContainer}}>
                <PaperText style={styles.descriptorText}>Current</PaperText>
                <PaperText style={styles.currentNumberText}>{currentWeight.toFixed(1)}</PaperText>
            </View>
        </View>
    );
}