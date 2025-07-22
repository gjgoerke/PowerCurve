import React, {useState, useCallback} from "react";
import { View, StyleSheet, Text, ScrollView } from "react-native";
import { router } from "expo-router";
import { Card, Text as PaperText, TextInput, SegmentedButtons, Button, Menu, Divider, Modal, Portal } from 'react-native-paper';

import { useBLEContext } from "@/context/BLEContext";
import DeviceScanModal from "@/components/DeviceScanModal";
import { TrainingParams } from "@/types/types";


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollContainer: {
        padding: 16,
        paddingTop: 46,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
        color: '#333',
    },
    card: {
        marginBottom: 16,
        elevation: 2,
        borderRadius: 12,
    },
    cardContent: {
        padding: 16,
    },
    textInputContainer: {
        flexDirection: 'row', 
        justifyContent: 'space-around',
        gap: 12,
    },
    singleInputContainer: {
        flex: 1,
    },
    selectionContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    gripButton: {
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    segmentedButtonsContainer: {
        marginVertical: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
        color: '#555',
    },
    numericInput: {
        borderRadius: 8,
        backgroundColor: '#fff',
    },
    timeInputsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    timeInput: {
        flex: 1,
        borderRadius: 8,
        backgroundColor: '#fff',
    },
    toleranceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    toleranceInput: {
        flex: 1,
        borderRadius: 8,
        backgroundColor: '#fff',
    },
    tolerancePrefix: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },
});

export default function Index() {

    const {
        requestPermissions,
        scanForDevices,
        allDevices,
        connectToDevice,
        connectedDevice,
        weightPacket,
        timestampPacket,
        tareConnectedDevice,
    } = useBLEContext();

    /*
    *   Temporary Grip Selection
    */
    const grips = ['Heavy Artifact', '20mm edge', '10mm edge'] as const;

    type Grip = typeof grips[number];

    /*
    * Input State
    */
    const [gripMenuVisible, setGripMenuVisible] = useState<boolean>(false);
    const [deviceScanModalVisible, setDeviceScanModalVisible] = useState<boolean>(false);

    const [grip, setGrip] = useState<Grip>('Heavy Artifact');
    const [hand, setHand] = useState<string>('left');

    const [durationMinutes, setDurationMinutes] = useState<number>(1);
    const [durationSeconds, setDurationSeconds] = useState<number>(0);
    const [restMinutes, setRestMinutes] = useState<number>(0);
    const [restSeconds, setRestSeconds] = useState<number>(20);
    const [numberOfSets, setNumberOfSets]  = useState<number>(10);
    const [trainingLoad, setTrainingLoad] = useState<number>(50);
    const [trainingLoadTolerance, setTrainingLoadTolerance] = useState<number>(5);
    const [timeTolerance, setTimeTolerance] = useState<number>(5);
    

    /*
    *   Input Handlers
    */
    const openGripMenu = useCallback(() => {
        setGripMenuVisible(true);
    }, []);

    const closeGripMenu = useCallback(() => {
        setGripMenuVisible(false);
    }, []);

    const selectGrip = useCallback((selectedGrip: Grip) => {
        setGrip(selectedGrip);
        closeGripMenu();
    }, [closeGripMenu]);

    const onChangeText = useCallback((value: string, setStateFunction: React.Dispatch<React.SetStateAction<number>>) => {
        const numericValue = value.replace(/[^0-9]/g, '');
        setStateFunction(Number(numericValue));
    }, []);

    const navigateToTrain = () => {
        const trainingParams = {
            grip,
            hand,
            durationMinutes,
            durationSeconds,
            restMinutes,
            restSeconds,
            numberOfSets,
            trainingLoad,
            trainingLoadTolerance,
            timeTolerance,
        };

        router.replace({
            pathname: '/(tabs)/(training)/train',
            params: trainingParams
        });
    }

    const onBeginWorkout = () => {
        if(connectedDevice) {
            navigateToTrain();
        } else {
            setDeviceScanModalVisible(true);
        }
    }
    
    return (
        <>
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContainer}>
            {/* Grip Selection Section */}
            <View style={styles.section}>
                <PaperText style={styles.sectionTitle}>Grip & Hand</PaperText>
                <Card style={styles.card}>
                    <Card.Content style={styles.cardContent}>
                        <View style={styles.selectionContainer}>
                            <PaperText style={styles.label}>Grip Implement</PaperText>
                            <Menu
                                visible={gripMenuVisible}
                                onDismiss={closeGripMenu}
                                anchor={
                                    <Button 
                                        onPress={openGripMenu} 
                                        icon={'arrow-down-drop-circle-outline'}
                                        mode="outlined"
                                        style={styles.gripButton}
                                    >
                                        {grip}
                                    </Button>
                                }
                            >
                                <Menu.Item onPress={() => selectGrip('Heavy Artifact')} title="Heavy Artifact" />
                                <Menu.Item onPress={() => selectGrip('20mm edge')} title="20mm edge" />
                                <Menu.Item onPress={() => selectGrip('10mm edge')} title="10mm edge" />
                                <Divider />
                                <Menu.Item onPress={() => {}} leadingIcon={'plus'} title="Create grip" />
                            </Menu>
                        </View>

                        <View style={styles.segmentedButtonsContainer}>
                            <PaperText style={styles.label}>Hand</PaperText>
                            <SegmentedButtons
                                value={hand}
                                onValueChange={setHand}
                                buttons={[
                                    { value: 'left', label: 'Left Hand' },
                                    { value: 'right', label: 'Right Hand' },
                                ]}
                            />
                        </View>
                    </Card.Content>
                </Card>
            </View>

            {/* Timing Section */}
            <View style={styles.section}>
                <PaperText style={styles.sectionTitle}>Duration and Rest</PaperText>
                <Card style={styles.card}>
                    <Card.Content style={styles.cardContent}>
                        <View style={styles.section}>
                            <PaperText style={styles.label}>Duration</PaperText>
                            <View style={styles.timeInputsRow}>
                                <TextInput
                                    style={styles.timeInput}
                                    value={String(durationMinutes)}
                                    right={<TextInput.Affix text={durationMinutes === 1 ? " min" : " min"} />}
                                    keyboardType='number-pad'
                                    onChangeText={(text: string) => {
                                        onChangeText(text, setDurationMinutes);
                                    }}
                                />
                                <TextInput
                                    style={styles.timeInput}
                                    value={String(durationSeconds)}
                                    right={<TextInput.Affix text={durationSeconds === 1 ? " sec" : " sec"} />}
                                    keyboardType='number-pad'
                                    onChangeText={(text: string) => {
                                        onChangeText(text, setDurationSeconds);
                                    }}
                                />
                            </View>
                        </View>
                        
                        <View style={styles.section}>
                            <PaperText style={styles.label}>Rest Period</PaperText>
                            <View style={styles.timeInputsRow}>
                                <TextInput
                                    style={styles.timeInput}
                                    value={String(restMinutes)}
                                    right={<TextInput.Affix text={restMinutes === 1 ? " min" : " min"} />}
                                    keyboardType='number-pad'
                                    onChangeText={(text: string) => {
                                        onChangeText(text, setRestMinutes);
                                    }}
                                />
                                <TextInput
                                    style={styles.timeInput}
                                    value={String(restSeconds)}
                                    right={<TextInput.Affix text={restSeconds === 1 ? " sec" : " sec"} />}
                                    keyboardType='number-pad'
                                    onChangeText={(text: string) => {
                                        onChangeText(text, setRestSeconds);
                                    }}
                                />
                            </View>
                        </View>

                        <View style={styles.section}>
                            <PaperText style={styles.label}>Failure Tolerance</PaperText>
                            <View style={styles.singleInputContainer}>
                                <TextInput
                                    style={styles.numericInput}
                                    value={String(timeTolerance)}
                                    right={<TextInput.Affix text={timeTolerance === 1 ? " second" : " seconds"} />}
                                    keyboardType='number-pad'
                                    onChangeText={(text: string) => {
                                        onChangeText(text, setTimeTolerance);
                                    }}
                                />
                            </View>
                        </View>
                    </Card.Content>
                </Card>
            </View>

            {/* Sets and Load Section */}
            <View style={styles.section}>
                <PaperText style={styles.sectionTitle}>Sets and Load</PaperText>
                <Card style={styles.card}>
                    <Card.Content style={styles.cardContent}>
                        <View style={styles.section}>
                            <PaperText style={styles.label}>Number of Sets</PaperText>
                            <View style={styles.singleInputContainer}>
                                <TextInput
                                    style={styles.numericInput}
                                    value={String(numberOfSets)}
                                    right={<TextInput.Affix text={numberOfSets === 1 ? " set" : " sets"} />}
                                    keyboardType='number-pad'
                                    onChangeText={(text: string) => {
                                        onChangeText(text, setNumberOfSets);
                                    }}
                                />
                            </View>
                        </View>

                        <View style={styles.section}>
                            <PaperText style={styles.label}>Training Load</PaperText>
                            <View style={styles.singleInputContainer}>
                                <TextInput
                                    style={styles.numericInput}
                                    value={String(trainingLoad)}
                                    right={<TextInput.Affix text={" lbs"} />}
                                    keyboardType='number-pad'
                                    onChangeText={(text: string) => {
                                        onChangeText(text, setTrainingLoad);
                                    }}
                                />
                            </View>
                        </View>

                        <View style={styles.section}>
                            <PaperText style={styles.label}>Load Tolerance</PaperText>
                            <View style={styles.toleranceContainer}>
                                <PaperText style={styles.tolerancePrefix}>±</PaperText>
                                <TextInput
                                    style={styles.toleranceInput}
                                    value={String(trainingLoadTolerance)}
                                    right={<TextInput.Affix text={" lbs"} />}
                                    keyboardType='number-pad'
                                    onChangeText={(text: string) => {
                                        onChangeText(text, setTrainingLoadTolerance);
                                    }}
                                />
                            </View>
                        </View>
                    </Card.Content>
                </Card>
            </View>
            <Button mode="contained" onPress={onBeginWorkout}>Begin Workout!</Button>
        </ScrollView>
        <DeviceScanModal 
            visible={deviceScanModalVisible} 
            setVisible={setDeviceScanModalVisible} 
        />
        </>
    );
}