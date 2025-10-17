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

import { AndroidApp } from '@/types/app';

const { AppLauncher } = NativeModules;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CARD_WIDTH = SCREEN_WIDTH * 0.40;
const CARD_SPACING = 20;

// Importar todas las imágenes estáticamente
const appImages: { [key: string]: any } = {
  crx: require('../../assets/images/apps/crixto.png'),
  xitypay: require('../../assets/images/apps/xitypay.png'),
  aero: require('../../assets/images/apps/aero.png'),
  disco: require('../../assets/images/apps/disconect.png'),
  auto: require('../../assets/images/apps/auto.png'),
  corpo: require('../../assets/images/apps/corpo.png'),
  default: require('../../assets/images/apps/default.png'),
  // Agrega aquí todas tus apps
};

interface AppCardProps {
  app: AndroidApp;
  index: number;
  scrollX: SharedValue<number>;
}

export default function AppCard({ app, index, scrollX }: AppCardProps) {

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

  // Función para obtener la imagen correcta
  const getAppImage = () => {
    if (!app.icono_local) return appImages.default;
    
    const imageKey = app.icono_local.toLowerCase();
    return appImages[imageKey] ?? appImages.default;
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
      [0.9, 1, 0.9],
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
      <View style={styles.card}>
        {/* Fondo de la card - Imagen que ocupa todo el espacio */}
        <View style={styles.backgroundContainer}>
          <Image
            source={require('../../assets/images/fondo.png')}
            style={styles.cardBackground}
          />
        </View>

        {/* Contenido de la card */}
        <View style={styles.content}>
          <View style={styles.iconBorder}>
            <Image
              source={getAppImage()}
              style={styles.appIcon}
              defaultSource={require('../../assets/images/apps/default.png')} // Opcional: imagen por defecto
            />
          </View>

          <View style={styles.titleContainer}>
            <Text style={styles.title}>{app.titulo}</Text>
          </View>

          <Text style={styles.description} numberOfLines={3}>
            {app.descripcion_corta}
          </Text>

          <View style={styles.statsContainer}>
            {/* Espacio reservado */}
          </View>

          <Pressable onPress={handleOpenApp} style={styles.openButton}>
            <Image
              source={require('../../assets/images/button.png')}
              style={styles.buttonImage}
              resizeMode="contain"
            />
          </Pressable>
        </View>
      </View>
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
    padding: 0,
    alignItems: 'center',
    shadowColor: '#0f065a',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 10,
    minHeight: 700,
    borderWidth: 0,
    overflow: 'hidden',
    position: 'relative',
  },
  // Contenedor para el fondo
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  cardBackground: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  // Contenedor para el contenido
  content: {
    width: '100%',
    padding: 32,
    alignItems: 'center',
    zIndex: 1,
    flex: 1,
    justifyContent: 'space-between',
  },
  iconBorder: {
    // Estilos para el borde del icono si los necesitas
  },
  appIcon: {
    width: 150,
    height: 150,
    borderRadius: 30,
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: 120,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(15, 6, 90, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    textDecorationLine: 'underline',
    textDecorationStyle: 'solid',
    textDecorationColor: '#fff',
  },
  description: {
    fontSize: 18,
    color: '#fff',
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
  },
  openButton: {
    width: '80%',
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 'auto',
    marginLeft: 90
  },
  buttonImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
});