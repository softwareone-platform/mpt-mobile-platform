import React, { useEffect, useRef, useId } from 'react';
import { Animated, Easing, View, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect, ClipPath } from 'react-native-svg';
import NoResults from './no-results';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

type Props = {
  size?: number;
};

const DURATION = 625; // 1/4 of 2500ms

export default function NoResultsAnimated({ size = 32 }: Props) {
  const beforeGradient = useId();
  const drainClip = useId();
  const rotation = useRef(new Animated.Value(0)).current; // 0 → -45 → 0
  const clipHeight = useRef(new Animated.Value(10)).current; // drain animation

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(rotation, {
          toValue: 1,
          duration: DURATION,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(clipHeight, {
          toValue: 0,
          duration: DURATION,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(rotation, {
          toValue: 0,
          duration: DURATION,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(clipHeight, {
          toValue: 10,
          duration: 0,
          useNativeDriver: false,
        }),
      ]),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, []);

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-45deg'],
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.View style={{ transform: [{ rotate }] }}>
        <Svg width={size} height={size} viewBox="0 0 24 24" style={styles.before}>
          <Defs>
            <LinearGradient id={beforeGradient} x1="100%" y1="0%" x2="0%" y2="0%">
              <Stop offset="0%" stopColor="#00C9CD" />
              <Stop offset="50%" stopColor="#472AFF" />
              <Stop offset="75%" stopColor="#392D9C" />
              <Stop offset="100%" stopColor="#000000" />
            </LinearGradient>
            {/* @ts-ignore */}
            <ClipPath id={drainClip} clipPathUnits="userSpaceOnUse">
              <AnimatedRect x={2} y={2} width={20} height={clipHeight} />
            </ClipPath>
          </Defs>

          <Rect
            x={2}
            y={2}
            width={20}
            height={20}
            rx={10}
            fill={`url(#${beforeGradient})`}
            clipPath={`url(#${drainClip})`}
          />
        </Svg>
        <NoResults size={size} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  before: {
    position: 'absolute',
    transform: [{ scaleY: -1 }, { rotate: '-45deg' }],
  },
});
