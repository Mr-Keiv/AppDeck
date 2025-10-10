import { useState } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import Svg, { Path, G, Text as SvgText } from 'react-native-svg';

const { width } = Dimensions.get('window');
const WHEEL_SIZE = width * 0.62;
const RADIUS = WHEEL_SIZE / 2;

const SEGMENTS = [
  { color: '#0f065a', label: 'Sigue intentando' },
  { color: '#022de4', label: 'Llavero' },
  { color: '#022de4', label: 'Vaso' },
  { color: '#022de4', label: 'Cartuchero' },
  { color: '#022de4', label: 'Bolsa' },
];

const SEGMENT_ANGLE = 360 / SEGMENTS.length;

function WheelSegment({ segment, index }: { segment: typeof SEGMENTS[0]; index: number }) {
  const angle = SEGMENT_ANGLE;
  const startAngle = (index * angle - 90) * (Math.PI / 180);
  const endAngle = ((index + 1) * angle - 90) * (Math.PI / 180);

  const x1 = RADIUS + RADIUS * Math.cos(startAngle);
  const y1 = RADIUS + RADIUS * Math.sin(startAngle);
  const x2 = RADIUS + RADIUS * Math.cos(endAngle);
  const y2 = RADIUS + RADIUS * Math.sin(endAngle);

  const pathData = `M ${RADIUS} ${RADIUS} L ${x1} ${y1} A ${RADIUS} ${RADIUS} 0 0 1 ${x2} ${y2} Z`;

  const textAngle = index * angle + angle / 2;
  const textRadius = RADIUS * 0.7;
  const textAngleRad = (textAngle - 90) * (Math.PI / 180);
  const textX = RADIUS + textRadius * Math.cos(textAngleRad);
  const textY = RADIUS + textRadius * Math.sin(textAngleRad);

  const lines = segment.label.split('\n');
  const rotationAngle = textAngle;

  return (
    <G>
      <Path d={pathData} fill={segment.color} stroke="#fff" strokeWidth="4" />
      {segment.label && lines.map((line, i) => {
        const lineOffset = (i - (lines.length - 1) / 2) * 14;
        return (
          <SvgText
            key={i}
            x={textX}
            y={textY + lineOffset}
            fill="#ffff"
            fontSize="24"
            fontWeight="bold"
            textAnchor="middle"
            alignmentBaseline="middle"
            transform={`rotate(${rotationAngle + 0}, ${textX}, ${textY + lineOffset})`}
          >
            {line}
          </SvgText>
        );
      })}
    </G>
  );
}

export function WheelOfFortune() {
  const rotation = useSharedValue(0);
  const [currentAngle, setCurrentAngle] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);

  const updateAngle = (angle: number) => {
    setCurrentAngle(angle);
    setIsSpinning(false);
  };

  const startSpinning = () => {
    setIsSpinning(true);
  };

  const handleSpin = () => {
    if (isSpinning) return;

    const randomSpins = 5 + Math.random() * 3;
    const randomAngle = Math.random() * 360;
    const newRotation = rotation.value + randomSpins * 360 + randomAngle;

    runOnJS(startSpinning)();

    rotation.value = withTiming(
      newRotation,
      {
        duration: 4000,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      },
      () => {
        runOnJS(updateAngle)(newRotation % 360);
      }
    );
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (isSpinning) return;

      const velocity = Math.abs(event.velocityY) / 7;
      const newRotation = rotation.value + velocity;

      runOnJS(startSpinning)();

      rotation.value = withTiming(
        newRotation,
        {
          duration: 3000,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        },
        () => {
          runOnJS(updateAngle)(newRotation % 360);
        }
      );
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  return (
    <View style={styles.container}>

     

      <View style={styles.wheelContainer}>
        <View style={styles.arrow} />

        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.wheel, animatedStyle]}>
            <Svg width={WHEEL_SIZE} height={WHEEL_SIZE}>
              {SEGMENTS.map((segment, index) => (
                <WheelSegment key={index} segment={segment} index={index} />
              ))}
            </Svg>

            <TouchableOpacity
              style={styles.centerButton}
              onPress={handleSpin}
              disabled={isSpinning}
            >
              <View style={styles.centerButtonOuter}>
                <View style={styles.centerButtonInner}>
                  <Text style={styles.centerButtonText}>Girar</Text>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </GestureDetector>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  resultContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginBottom: 24,
    minWidth: 160,
    alignItems: 'center',
  },
  resultText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  wheelContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  arrow: {
    position: 'absolute',
    top: -0,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 14,
    borderRightWidth: 14,
    borderTopWidth: 24,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#ffa600',
    zIndex: 10,
    shadowColor: '#ffa600',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  wheel: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 20,
  },
  centerButton: {
    position: 'absolute',
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerButtonOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 10,
  },
  centerButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0f065a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  instruction: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontWeight: '600',
    maxWidth: 240,
  },
});
