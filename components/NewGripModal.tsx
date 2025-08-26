import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Portal, Modal, Card, Text as PaperText, IconButton, TextInput, Button } from "react-native-paper";

import { newGrip } from "@/utils/databaseUtils";

const styles = StyleSheet.create({
    buttonsContainer: {
        flexDirection: 'row',
        alignContent: 'space-around',
        justifyContent: 'space-around',
        marginTop: 15
    },
    card: {
        width: '90%',
        alignSelf: 'center',
        borderRadius: 16,
        elevation: 0,
    },

});

interface Props {
    visible: boolean;
    setVisible: React.Dispatch<React.SetStateAction<boolean>>;
    loadGrips: () => {};
    selectGrip: (selectedGrip: string) => void;
};

export default function NewGripModal ( { visible, setVisible, loadGrips, selectGrip } : Props) {

    const database = useSQLiteContext();
    const [newgripName, setNewGripName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleDismiss = useCallback(() => {
        setVisible(false);
    }, []);

    const handleSave = async () => {
        console.log('saving grip ', newgripName);
        setIsLoading(true);
        newGrip(database, newgripName);
        loadGrips();
        selectGrip(newgripName);
        setIsLoading(false);
        setVisible(false);
    };

    const handleTextInput = useCallback((text: string) => {
        setNewGripName(text);
    }, [])

    return(
        <Portal>
            <Modal
                visible={visible}
                onDismiss={handleDismiss}
            >
                <Card style={styles.card}>
                    <Card.Content>
                        <TextInput mode="outlined" onChangeText={handleTextInput} />
                        <View style={styles.buttonsContainer}>
                            <Button mode="contained-tonal" onPress={handleDismiss}>Cancel</Button>
                            <Button mode="contained" onPress={handleSave} loading={isLoading}>Save</Button>
                        </View>
                    </Card.Content>
                </Card>
            </Modal>
        </Portal>
    );
}