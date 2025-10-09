import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  Alert,
  Platform,
  NativeModules,
  Dimensions,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolate,
  SharedValue,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { ExternalLink } from 'lucide-react-native';
import { AndroidApp } from '@/types/app';

const { AppLauncher } = NativeModules;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CARD_WIDTH = SCREEN_WIDTH * 0.4;
const CARD_SPACING = 20;

interface AppCardProps {
  app: AndroidApp;
  index: number;
  scrollX: SharedValue<number>;
}

export default function AppCard({ app, index, scrollX }: AppCardProps) {

  console.log(CARD_WIDTH)

  const handleOpenApp = async () => {
    if (Platform.OS !== 'android') {
      Alert.alert(
        'No disponible',
        'La apertura de apps solo funciona en dispositivos Android.'
      );
      return;
    }

    if (!AppLauncher) {
      Alert.alert(
        'Módulo no disponible',
        'El módulo AppLauncher no está disponible. Necesitas compilar la app nativa.'
      );
      return;
    }

    try {
      await AppLauncher.launchApp(app.package_name);
    } catch (err: any) {
      const errorMessage =
        err.code === 'APP_NOT_FOUND'
          ? `"${app.titulo}" no está instalada.`
          : `Error al abrir "${app.titulo}"`;

      Alert.alert('No se pudo abrir', errorMessage, [
        { text: 'OK', style: 'cancel' },
      ]);
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * (CARD_WIDTH + CARD_SPACING),
      index * (CARD_WIDTH + CARD_SPACING),
      (index + 1) * (CARD_WIDTH + CARD_SPACING),
    ];

    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.85, 1, 0.85],
      Extrapolate.CLAMP
    );

    const rotateY = interpolate(
      scrollX.value,
      inputRange,
      [45, 0, -45],
      Extrapolate.CLAMP
    );

    const translateX = interpolate(
      scrollX.value,
      inputRange,
      [-30, 0, 30],
      Extrapolate.CLAMP
    );

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.4, 1, 0.4],
      Extrapolate.CLAMP
    );

    return {
      transform: [
        { perspective: 1000 },
        { translateX },
        { rotateY: `${rotateY}deg` },
        { scale },
      ],
      opacity,
    };
  });

  return (
    <Animated.View style={[styles.cardContainer, animatedStyle]}>
      <LinearGradient
        colors={['#ffffff', '#ffffff', '#ffffff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}>
        <View style={styles.cardGlow} />

        <View style={styles.iconWrapper}>
          <View style={styles.iconGlow} />
          <View style={styles.iconBorder}>
            <Image source={{ uri: app.icono_url }} style={styles.appIcon} />
          </View>
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>{app.titulo}</Text>
          <View style={styles.titleUnderline} />
        </View>

        <Text style={styles.description} numberOfLines={3}>
          {app.descripcion_corta}
        </Text>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <View style={styles.statDot} />
            <Text style={styles.statText}>Activa</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View style={[styles.statDot, { backgroundColor: '#10b981' }]} />
            <Text style={styles.statText}>Lista</Text>
          </View>
        </View>

        <Pressable onPress={handleOpenApp} style={styles.openButton}>
          <LinearGradient
            colors={['#0f065a', '#0f065a', '#0f065a']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.openButtonGradient}>
            <View style={styles.buttonShine} />
            <Text style={styles.openButtonText}>Abrir aplicación</Text>
            <ExternalLink size={20} color="#fff" strokeWidth={2.5} />
          </LinearGradient>
        </Pressable>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: CARD_WIDTH,
    marginHorizontal: CARD_SPACING / 2,
  },
  card: {
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#0f065a',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 20,
    minHeight: 550,
    borderWidth: 1,
    borderColor: 'rgba(15, 6, 90, 0.3)',
    overflow: 'hidden',
  },
  cardGlow: {
    position: 'absolute',
    top: -100,
    left: -100,
    right: -100,
    height: 200,
    backgroundColor: '#0f065a',
    opacity: 0.15,
    borderRadius: 200,
  },
  iconWrapper: {
    marginTop: 40,
    marginBottom: 32,
    position: 'relative',
  },
  iconGlow: {
    position: 'absolute',
    top: -25,
    left: -25,
    right: -25,
    bottom: -25,
    backgroundColor: '#0f065a',
    opacity: 0.25,
    borderRadius: 85,
  },
  iconBorder: {
    padding: 8,
    borderRadius: 38,
    borderWidth: 3,
    borderColor: 'rgba(15, 6, 90, 0.5)',
    backgroundColor: 'rgba(30, 30, 46, 0.8)',
  },
  appIcon: {
    width: 120,
    height: 120,
    borderRadius: 30,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#000',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(15, 6, 90, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  titleUnderline: {
    width: 60,
    height: 3,
    backgroundColor: '#0f065a',
    borderRadius: 2,
  },
  description: {
    fontSize: 15,
    color: 'rgba(0, 0, 0, 0.7)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(15, 6, 90, 0.15)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(15, 6, 90, 0.3)',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0f065a',
  },
  statText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(0, 0, 0, 0.85)',
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    marginHorizontal: 16,
  },
  openButton: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 'auto',
  },
  openButtonGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    position: 'relative',
  },
  buttonShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  openButtonText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
});
