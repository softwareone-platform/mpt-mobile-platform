import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { bottomSheetStyle } from '@/styles';

type Props = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  snapHeight?: number;
};

const SCREEN_HEIGHT = Dimensions.get('window').height;
const DEFAULT_SNAP_HEIGHT = 0.9;
const CLOSE_THRESHOLD = 120;
const DRAG_ACTIVATION_THRESHOLD = 5;

const BottomSheet = ({ visible, onClose, children, snapHeight = DEFAULT_SNAP_HEIGHT }: Props) => {
  const [internalVisible, setInternalVisible] = useState(false);
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const SHEET_MAX_HEIGHT = SCREEN_HEIGHT * snapHeight;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dy) > DRAG_ACTIVATION_THRESHOLD,
      onPanResponderMove: (_, gestureState) => {
        const newY = SCREEN_HEIGHT - SHEET_MAX_HEIGHT + gestureState.dy;
        if (newY >= SCREEN_HEIGHT - SHEET_MAX_HEIGHT) {
          translateY.setValue(newY);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > CLOSE_THRESHOLD) {
          onClose();
        } else {
          Animated.spring(translateY, {
            toValue: SCREEN_HEIGHT - SHEET_MAX_HEIGHT,
            useNativeDriver: true,
            stiffness: 100,
            damping: 20,
          }).start();
        }
      },
    }),
  ).current;

  useEffect(() => {
    if (visible) {
      setInternalVisible(true);
      Animated.spring(translateY, {
        toValue: SCREEN_HEIGHT - SHEET_MAX_HEIGHT,
        useNativeDriver: true,
        stiffness: 250,
        damping: 28,
        mass: 1,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 220,
        useNativeDriver: true,
      }).start(() => setInternalVisible(false));
    }
  }, [visible, translateY, SHEET_MAX_HEIGHT]);

  if (!internalVisible) {
    return null;
  }

  return (
    <Modal transparent animationType="none" visible={internalVisible}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <Animated.View
        style={[styles.sheet, { height: SHEET_MAX_HEIGHT, transform: [{ translateY }] }]}
      >
        <View style={styles.grabber} {...panResponder.panHandlers} />
        {children}
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: bottomSheetStyle.backdrop,
  sheet: bottomSheetStyle.sheet,
  grabber: bottomSheetStyle.grabber,
});

export default BottomSheet;
