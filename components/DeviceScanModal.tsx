import React from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Button, Portal, Modal, Card, Text as PaperText, ActivityIndicator, Divider, IconButton } from "react-native-paper";

import { useBLEContext } from "@/context/BLEContext";

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        width: '90%',
        maxWidth: 400,
        backgroundColor: 'white',
        borderRadius: 16,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    card: {
        borderRadius: 16,
        elevation: 0,
    },
    cardContent: {
        padding: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
    },
    closeButton: {
        margin: 0,
    },
    scanningContainer: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    scanningText: {
        fontSize: 16,
        color: '#666',
        marginTop: 16,
        textAlign: 'center',
    },
    scanButton: {
        marginVertical: 16,
        borderRadius: 8,
    },
    deviceList: {
        marginTop: 16,
    },
    deviceItem: {
        marginVertical: 4,
        borderRadius: 8,
    },
    deviceButton: {
        justifyContent: 'flex-start',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    deviceName: {
        fontSize: 16,
        fontWeight: '500',
    },
    noDevicesText: {
        textAlign: 'center',
        color: '#666',
        fontStyle: 'italic',
        marginTop: 16,
    },
    connectedContainer: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    weightDisplay: {
        fontSize: 32,
        fontWeight: '700',
        color: '#2196F3',
        marginBottom: 24,
    },
    weightUnit: {
        fontSize: 16,
        color: '#666',
        marginTop: 4,
    },
    tareButton: {
        borderRadius: 8,
        marginTop: 16,
    },
    divider: {
        marginVertical: 16,
        backgroundColor: '#e0e0e0',
    }
});

interface Props {
    visible: boolean;
    setVisible: React.Dispatch<React.SetStateAction<boolean>>;
    navigateToTrain: () => void;
};

export default function DeviceScanModal({visible, setVisible, navigateToTrain} : Props) {
    const {
        requestPermissions,
        scanForDevices,
        isScanningForDevices,
        allDevices,
        connectToDevice,
        connectedDevice,
        weightPacket,
        timestampPacket,
        tareConnectedDevice,
    } = useBLEContext();

    const dataIsStreaming = timestampPacket[0] > 0;

    const handleClose = () => {
        setVisible(false);
    };

    const handleTare = () => {
        tareConnectedDevice();
        setVisible(false);
        navigateToTrain();
    };

    return(
        <Portal>
            <Modal
                visible={visible}
                onDismiss={handleClose}
                contentContainerStyle={styles.modalOverlay}
            >
                <View style={styles.modalContainer}>
                    {!dataIsStreaming ? (
                        <Card style={styles.card}>
                            <Card.Content style={styles.cardContent}>
                                <View style={styles.header}>
                                    <PaperText style={styles.title}>Connect Device</PaperText>
                                    <IconButton
                                        icon="close"
                                        size={24}
                                        onPress={handleClose}
                                        style={styles.closeButton}
                                    />
                                </View>

                                {isScanningForDevices ? (
                                    <View style={styles.scanningContainer}>
                                        <ActivityIndicator size="large" color="#2196F3" />
                                        <PaperText style={styles.scanningText}>
                                            Scanning for devices...
                                        </PaperText>
                                    </View>
                                ) : (
                                    <>
                                        <Button 
                                            mode="contained" 
                                            onPress={scanForDevices}
                                            style={styles.scanButton}
                                            icon="bluetooth-connect"
                                        >
                                            Scan for Devices
                                        </Button>

                                        {/* {allDevices.length > 0 && (
                                            <View style={styles.deviceList}>
                                                <Divider style={styles.divider} />
                                                <PaperText style={styles.title}>Available Devices</PaperText>
                                                {allDevices.map((device) => (
                                                    <Button
                                                        key={device.id}
                                                        mode="outlined"
                                                        onPress={() => connectToDevice(device)}
                                                        style={styles.deviceItem}
                                                        contentStyle={styles.deviceButton}
                                                        icon="bluetooth"
                                                    >
                                                        <PaperText style={styles.deviceName}>
                                                            {device.name || 'Unknown Device'}
                                                        </PaperText>
                                                    </Button>
                                                ))}
                                            </View>
                                        )} */}

                                        {!isScanningForDevices && allDevices.length === 0 && (
                                            <PaperText style={styles.noDevicesText}>
                                                No devices found. Tap "Scan for Devices" to search.
                                            </PaperText>
                                        )}
                                    </>
                                )}
                                {allDevices.length > 0 && (
                                            <View style={styles.deviceList}>
                                                <Divider style={styles.divider} />
                                                <PaperText style={styles.title}>Available Devices</PaperText>
                                                {allDevices.map((device) => (
                                                    <Button
                                                        key={device.id}
                                                        mode="outlined"
                                                        onPress={() => connectToDevice(device)}
                                                        style={styles.deviceItem}
                                                        contentStyle={styles.deviceButton}
                                                        icon="bluetooth"
                                                    >
                                                        <PaperText style={styles.deviceName}>
                                                            {device.name || 'Unknown Device'}
                                                        </PaperText>
                                                    </Button>
                                                ))}
                                            </View>
                                )}
                            </Card.Content>
                        </Card>
                    ) : (
                        <Card style={styles.card}>
                            <Card.Content style={styles.cardContent}>
                                <View style={styles.header}>
                                    <PaperText style={styles.title}>Device Connected</PaperText>
                                    <IconButton
                                        icon="close"
                                        size={24}
                                        onPress={handleClose}
                                        style={styles.closeButton}
                                    />
                                </View>

                                <View style={styles.connectedContainer}>
                                    <PaperText style={styles.weightDisplay}>
                                        {Math.abs(weightPacket[14])?.toFixed(1) || '0.0'}
                                    </PaperText>
                                    <PaperText style={styles.weightUnit}>kg</PaperText>
                                    
                                    <Button 
                                        mode="contained" 
                                        onPress={handleTare}
                                        style={styles.tareButton}
                                        icon="scale-balance"
                                    >
                                        Tare
                                    </Button>
                                </View>
                            </Card.Content>
                        </Card>
                    )}
                </View>
            </Modal>
        </Portal>
    );
}