import { View, Text, Pressable, StyleSheet } from 'react-native';
import { PropsWithChildren, memo } from 'react';
import Modal from 'react-native-modal';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

type Props = PropsWithChildren<{
  isVisible: boolean;
  onClose: () => void;
  title: string;
}>;

const TrainingModal = memo(function TrainingModal({ isVisible, children, onClose, title}: Props) {
  return (
    <View>
    <Modal 
        style={styles.modal}
        animationIn={'slideInUp'}
        animationOut={'slideOutDown'}
        hideModalContentWhileAnimating={true}
        isVisible={isVisible}
        onBackdropPress={onClose}
    >
        <View style={styles.modalContent}>
        <View style={styles.titleContainer}>
            <Text style={styles.title}>{title}</Text>
        </View>
        {children}
        </View>
    </Modal>
    </View>
  );
});

const styles = StyleSheet.create({
    modal: {
        borderRadius: 18
    },
    modalContent: {
        height: '40%',
        width: '100%',
        backgroundColor: '#ffffff',
        borderRadius: 10,
        position: 'absolute',
        bottom: 0,
    },
    titleContainer: {
        height: '16%',
        backgroundColor: '#ffffff',
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center', 
    },
    title: {
        fontSize: 16,
        fontWeight: '600', 
    },
});

export default TrainingModal;
