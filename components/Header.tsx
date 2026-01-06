import * as React from 'react';
import { Appbar } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

interface Props {
    title?: string;
} 
const Header = ({title}: Props) => {
    const styles = StyleSheet.create({
        container: {
            alignContent: "center",
            alignItems: "center",
            flexDirection: "row",
        }
    });
    
    return (
        <View style={styles.container}>
            <Appbar.BackAction
                onPress={router.back}
            />
            <Appbar.Content title={title} />
        </View>
    );
}

export default Header
