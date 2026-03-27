import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { Rect, Svg } from 'react-native-svg';
import ChatBubblePath from './chat-bubble';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

export default function AnimatedChatIcon({ size = 48, color = '#3366FF', textColor = '#959BFF' }) {
  const r1 = useRef(new Animated.Value(0)).current;
  const r2 = useRef(new Animated.Value(0)).current;
  const r3 = useRef(new Animated.Value(0)).current;

  const INITIAL_WIDTH = 0;
  const MAX_WIDTH = 32;
  const DURATION_GROW = 400;
  const DURATION_SHRINK = 200;

  const lineGrowAnimation = {
    toValue: MAX_WIDTH,
    duration: DURATION_GROW,
    easing: Easing.linear,
    useNativeDriver: false,
  };

  const lineShrinkAnimation = {
    toValue: INITIAL_WIDTH,
    duration: DURATION_SHRINK,
    easing: Easing.linear,
    useNativeDriver: false,
  };

  useEffect(() => {
    const loop = () => {
      Animated.sequence([
        Animated.timing(r1, lineGrowAnimation),
        Animated.timing(r2, lineGrowAnimation),
        Animated.timing(r3, {
          ...lineGrowAnimation,
          toValue: MAX_WIDTH * 0.7,
        }),
        Animated.delay(1000),
        Animated.parallel([
          Animated.timing(r1, lineShrinkAnimation),
          Animated.timing(r2, lineShrinkAnimation),
          Animated.timing(r3, lineShrinkAnimation),
        ]),
      ]).start(() => loop());
    };
    loop();
  }, []);

  // Interpolate opacity from width: 0 → 20% opacity, full width → 100%
  const opacity1 = r1.interpolate({ inputRange: [0, MAX_WIDTH], outputRange: [0.2, 1] });
  const opacity2 = r2.interpolate({ inputRange: [0, MAX_WIDTH], outputRange: [0.2, 1] });
  const opacity3 = r3.interpolate({ inputRange: [0, MAX_WIDTH * 0.7], outputRange: [0.2, 1] });

  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <ChatBubblePath color={color} />

      <AnimatedRect x={8} y={10} width={r1} height={3} fill={textColor} opacity={opacity1} />
      <AnimatedRect x={8} y={18} width={r2} height={3} fill={textColor} opacity={opacity2} />
      <AnimatedRect x={8} y={26} width={r3} height={3} fill={textColor} opacity={opacity3} />
    </Svg>
  );
}
