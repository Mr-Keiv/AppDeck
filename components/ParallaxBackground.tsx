import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface ParallaxBackgroundProps {
  scrollY: Animated.SharedValue<number>;
}

export function ParallaxBackground({ scrollY }: ParallaxBackgroundProps) {
  const backgroundStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, 500],
      [0, -150],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ translateY }],
    };
  });

  const gradientStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 200, 400],
      [1, 0.8, 0.6],
      Extrapolate.CLAMP
    );

    return { opacity };
  });

  return (
    <>
      <Animated.View style={[styles.backgroundContainer, backgroundStyle]}>
        <LinearGradient
          colors={['#0a0a0a', '#1a1a2e', '#16213e', '#0a0a0a']}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>
      <Animated.View style={[styles.overlay, gradientStyle]}>
        <LinearGradient
          colors={['rgba(59, 130, 246, 0.1)', 'transparent', 'rgba(139, 92, 246, 0.1)']}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  backgroundContainer: {
    position: 'absolute',
    top: -100,
    left: 0,
    right: 0,
    height: '120%',
  },
  gradient: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
