import React, {useState, useCallback} from "react";
import { View, StyleSheet, Text } from "react-native";
import { Card, Text as PaperText, TextInput, SegmentedButtons } from 'react-native-paper';


const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f5f5f5',
        marginTop: 30
    },
    textInputContainer: {
        flexDirection: 'row', 
        justifyContent: 'space-around'
    },
    text: {
        marginTop: 30
    },
    numericInput: {

    }
});

export default function Index() {

    const [grip, setGrip] = useState<string>('open');
    const [hand, setHand] = useState<string>('left');

    const [durationMinutes, setDurationMinutes] = useState<number>(1);
    const [durationSeconds, setDurationSeconds] = useState<number>(0);
    const [restMinutes, setRestMinutes] = useState<number>(0);
    const [restSeconds, setRestSeconds] = useState<number>(20);
    const [numberOfSets, setNumberOfSets]  = useState<number>(10);
    const [trainingLoad, setTrainingLoad] = useState<number>(50);
    const [trainingLoadTolerance, setTrainingLoadTolerance] = useState<number>(5);
    const [timeTolerance, setTimeTolerance] = useState<number>(5);
    
    const onChangeText = useCallback((value: string, setStateFunction: React.Dispatch<React.SetStateAction<number>>) => {
        const numericValue = value.replace(/[^0-9]/g, '');
        setStateFunction(Number(numericValue));
    }, []);
    
    return (
        <View style={styles.container}>

            <View>
                <PaperText>Grip</PaperText>
                <SegmentedButtons
                    value={grip}
                    onValueChange={setGrip}
                    buttons={[
                        { value: 'open', label: 'Open' },
                        { value: 'closed', label: 'Closed' },
                        { value: 'half', label: 'Half' },
                    ]}
                    style={{ marginVertical: 8 }}
                />
            </View>

            <View>
                <PaperText>Hand</PaperText>
                <SegmentedButtons
                    value={hand}
                    onValueChange={setHand}
                    buttons={[
                        { value: 'left', label: 'Left' },
                        { value: 'right', label: 'Right' },
                    ]}
                    style={{ marginVertical: 8 }}
                />
            </View>

            <View>
                <PaperText>Duration</PaperText>
                <View style={styles.textInputContainer}>
                    <TextInput
                        value={String(durationMinutes)}
                        right={<TextInput.Affix text={durationMinutes === 1 ? " Minute" : " Minutes"} />}
                        keyboardType='number-pad'
                        onChangeText={(text: string) => {
                            onChangeText(text, setDurationMinutes);
                        }}
                    />
                    <TextInput
                        value={String(durationSeconds)}
                        right={<TextInput.Affix text={durationSeconds === 1 ? " Second" : " Seconds"} />}
                        keyboardType='number-pad'
                        onChangeText={(text: string) => {
                            onChangeText(text, setDurationSeconds);
                        }}
                    />
                </View>
            </View>
            
            <View>
                <PaperText>Rest</PaperText>
                <View style={styles.textInputContainer}>
                    <TextInput
                        value={String(restMinutes)}
                        right={<TextInput.Affix text={restMinutes === 1 ? " Minute" : " Minutes"} />}
                        keyboardType='number-pad'
                        onChangeText={(text: string) => {
                            onChangeText(text, setRestMinutes);
                        }}
                    />
                    <TextInput
                        value={String(restSeconds)}
                        right={<TextInput.Affix text={restSeconds === 1 ? " Second" : " Seconds"} />}
                        keyboardType='number-pad'
                        onChangeText={(text: string) => {
                            onChangeText(text, setRestSeconds);
                        }}
                    />
                </View>
            </View>
            
            <View>
                <PaperText>Failure Tolerance</PaperText>
                <View style={styles.textInputContainer}>
                    <TextInput
                        value={String(timeTolerance)}
                        right={<TextInput.Affix text={timeTolerance === 1 ? " Second" : " Seconds"} />}
                        keyboardType='number-pad'
                        onChangeText={(text: string) => {
                            onChangeText(text, setTimeTolerance);
                        }}
                    />
                </View>
            </View>
            
            <View>
                <PaperText>Number of Sets</PaperText>
                <View style={styles.textInputContainer}>
                    <TextInput
                        value={String(numberOfSets)}
                        right={<TextInput.Affix text={numberOfSets === 1 ? " Set" : " Sets"} />}
                        keyboardType='number-pad'
                        onChangeText={(text: string) => {
                            onChangeText(text, setNumberOfSets);
                        }}
                    />
                </View>
            </View>

            <View>
                <PaperText>Load</PaperText>
                <View style={styles.textInputContainer}>
                    <TextInput
                        value={String(trainingLoad)}
                        right={<TextInput.Affix text={" lbs"} />}
                        keyboardType='number-pad'
                        onChangeText={(text: string) => {
                            onChangeText(text, setTrainingLoad);
                        }}
                    />
                </View>
            </View>

            <View>
                <PaperText>Load Tolerance</PaperText>
                <View style={styles.textInputContainer}>
                    <TextInput
                        value={String(trainingLoadTolerance)}
                        right={<TextInput.Affix text={" lbs"} />}
                        left={<TextInput.Affix text={"±"}/>}
                        keyboardType='number-pad'
                        onChangeText={(text: string) => {
                            onChangeText(text, setTrainingLoadTolerance);
                        }}
                    />
                </View>
            </View>
        </View>
    );
}