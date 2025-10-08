import { View, Text, Image, StyleSheet, Pressable, Platform } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { AndroidApp } from '@/types/app';

interface FloatingCardProps {
  app: AndroidApp;
  index: number;
  scrollY: Animated.SharedValue<number>;
  onPress: () => void;
}

const CARD_HEIGHT = 180;
const CARD_MARGIN = 16;
const ITEM_SIZE = CARD_HEIGHT + CARD_MARGIN;

export function FloatingCard({ app, index, scrollY, onPress }: FloatingCardProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 2) * ITEM_SIZE,
      (index - 1) * ITEM_SIZE,
      index * ITEM_SIZE,
      (index + 1) * ITEM_SIZE,
      (index + 2) * ITEM_SIZE,
    ];

    const scale = interpolate(
      scrollY.value,
      inputRange,
      [0.85, 0.9, 1, 0.9, 0.85],
      Extrapolate.CLAMP
    );

    const opacity = interpolate(
      scrollY.value,
      inputRange,
      [0.5, 0.7, 1, 0.7, 0.5],
      Extrapolate.CLAMP
    );

    const translateY = interpolate(
      scrollY.value,
      inputRange,
      [20, 10, 0, 10, 20],
      Extrapolate.CLAMP
    );

    const rotateX = interpolate(
      scrollY.value,
      inputRange,
      [10, 5, 0, -5, -10],
      Extrapolate.CLAMP
    );

    return {
      transform: [
        { scale },
        { translateY },
        { perspective: 1000 },
        { rotateX: `${rotateX}deg` },
      ],
      opacity,
    };
  });

  return (
    <Animated.View style={[styles.cardContainer, animatedStyle]}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.card,
          pressed && Platform.OS === 'web' && styles.cardPressed,
        ]}>
        <View style={styles.cardGlow} />
        <View style={styles.cardContent}>
          <View style={styles.iconContainer}>
            <Image source={{ uri: app.icono_url }} style={styles.icon} />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {app.titulo}
            </Text>
            <Text style={styles.description} numberOfLines={2}>
              {app.descripcion_corta}
            </Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    height: CARD_HEIGHT,
    marginHorizontal: 20,
    marginVertical: CARD_MARGIN / 2,
  },
  card: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  cardPressed: {
    opacity: 0.8,
  },
  cardGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  icon: {
    width: 60,
    height: 60,
    borderRadius: 14,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
  },
});
