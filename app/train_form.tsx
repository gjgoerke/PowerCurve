import React, {useState, useCallback, useEffect} from "react";
import { View, StyleSheet, Text, ScrollView } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Card, Text as PaperText, TextInput, SegmentedButtons, Button, Menu, Divider, Modal, Portal } from 'react-native-paper';

import Header from "@/components/Header"
import { useBLEContext } from "@/context/BLEContext";
import DeviceScanModal from "@/components/DeviceScanModal";
import { Grip, TrainingParams } from "@/types/types";
import { navigate } from "expo-router/build/global-state/routing";
import CreateGripModal from "@/components/NewGripModal";
import { allGrips as getAllGrips } from "@/utils/databaseUtils";
import { useSQLiteContext } from "expo-sqlite";
import { SafeAreaView } from "react-native-safe-area-context";


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollContainer: {
        padding: 16,
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

export default function TrainForm() {

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
    * Input State
    */
    const [simulationStream, setSimulationStream] = useState<boolean>(false);

    const [allGrips, setAllGrips] = useState<any[]>([]);

    const [gripMenuVisible, setGripMenuVisible] = useState<boolean>(false);
    const [createGripModalVisible, setCreateGripModalVisible] = useState<boolean>(false);
    const [deviceScanModalVisible, setDeviceScanModalVisible] = useState<boolean>(false);

    const [grip, setGrip] = useState<string>();
    const [hand, setHand] = useState<string>('left');

    const [durationMinutes, setDurationMinutes] = useState<number>(0);
    const [durationSeconds, setDurationSeconds] = useState<number>(120);
    const [restMinutes, setRestMinutes] = useState<number>(0);
    const [restSeconds, setRestSeconds] = useState<number>(20);
    const [numberOfSets, setNumberOfSets]  = useState<number>(10);
    const [trainingLoad, setTrainingLoad] = useState<number>(30);
    const [trainingLoadTolerance, setTrainingLoadTolerance] = useState<number>(2);
    const [timeTolerance, setTimeTolerance] = useState<number>(5);

    /*
    *   Load Grips
    */
    const database = useSQLiteContext();

    const loadGrips = async (initialLoad?: boolean) => {
        const gripsData: Grip[] = await getAllGrips(database) as Grip[];
        console.log(gripsData)
        setAllGrips(gripsData);
        if (initialLoad) setGrip(gripsData[0].name);
    };

    useEffect(() => {
        loadGrips(true);
    }, []);

    useEffect(() => {
        loadGrips();
    }, [database]);
    

    /*
    *   Input Handlers
    */
    const openGripMenu = useCallback(() => {
        setGripMenuVisible(true);
    }, []);

    const closeGripMenu = useCallback(() => {
        setGripMenuVisible(false);
    }, []);

    const selectGrip = useCallback((selectedGrip: string) => {
        setGrip(selectedGrip);
        closeGripMenu();
    }, [closeGripMenu]);

    const openCreateGripModal = useCallback(() => {
        closeGripMenu();
        setCreateGripModalVisible(true);
    }, [])

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
            simulationStream: simulationStream.toString()
        };

        router.replace({
            pathname: '/train',
            params: trainingParams
        });
    }

    const onBeginWorkout = () => {
        if(simulationStream || connectedDevice) {
            navigateToTrain();
        } else {
            setDeviceScanModalVisible(true);
        }
    }
    
    return (
        <>
        <SafeAreaView style={{flex: 1}}>
            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContainer}>
                <Header/>
                {/* Dev Mode */}
                <View style={styles.section}>
                <PaperText style={styles.sectionTitle}>Use Simulation Data Stream</PaperText>
                    <SegmentedButtons
                        value={simulationStream ? 'true' : 'false'}
                        onValueChange={(value) => {setSimulationStream(value === 'true');}}
                        buttons={[
                            { value: 'true', label: 'True' },
                            { value: 'false', label: 'False' },
                        ]}
                    />
                </View>

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
                                    {allGrips.map(grip => (
                                        <Menu.Item onPress={() => selectGrip(grip.name)} title={grip.name} key={grip.id}/>
                                    ))}
                                    <Divider />
                                    <Menu.Item onPress={openCreateGripModal} leadingIcon={'plus'} title="New grip" />
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
                <Button mode="contained" onPress={onBeginWorkout} style={{marginBottom: 50}}>Begin Workout!</Button>
            </ScrollView>
        </SafeAreaView>
        <CreateGripModal
            visible={createGripModalVisible}
            setVisible={setCreateGripModalVisible}
            loadGrips={loadGrips}
            selectGrip={selectGrip}
        />
        <DeviceScanModal 
            visible={deviceScanModalVisible} 
            setVisible={setDeviceScanModalVisible} 
            navigateToTrain={navigateToTrain}
        />
    </>
    );
}