import { useEffect, useState, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Card, Text as PaperText } from 'react-native-paper';

import { useTheme } from 'react-native-paper';

interface WeightsCardProps {
    lastWeight: number;
    currentSet: number;
    numSets: number;
    currentSetAvgWeight: number;
    currentPhase: 'workoutNotBegun' | 'training' | 'resting' | 'workoutComplete';
    height: number;
    margin: number;
    padding: number;
}

export default function WeightsCard ({lastWeight, currentSet, numSets, currentSetAvgWeight, currentPhase, height, margin, padding} : WeightsCardProps) {

    const theme = useTheme();
    const styles = useMemo(() => StyleSheet.create({
        container: {
            padding: padding,
            margin: margin,
            minHeight: height, 
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
    
    if(!lastWeight) {
        return null;
    }

    return(
        <View style={styles.container}>
            <View style={styles.maxAvgContainer}>
                <View style={styles.descriptorNumberContainer}>
                    <PaperText style={styles.descriptorText}>Set</PaperText>
                    <PaperText style={styles.maxAvgNumberText}>{currentSet} of {numSets}</PaperText>
                </View>
                <View style={styles.descriptorNumberContainer}>
                    <PaperText style={styles.descriptorText}>Avg.</PaperText>
                    <PaperText style={styles.maxAvgNumberText}>{currentPhase === 'training' ? currentSetAvgWeight.toFixed(1) : 0}</PaperText>
                </View>
            </View>
            <View style={{alignSelf: 'center', ...styles.descriptorNumberContainer}}>
                <PaperText style={styles.descriptorText}>Current</PaperText>
                <PaperText style={styles.currentNumberText}>{lastWeight.toFixed(1)}</PaperText>
            </View>
        </View>
    );
}