import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  Alert,
  Platform,
  NativeModules,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, ExternalLink } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { AndroidApp } from '@/types/app';

const { AppLauncher } = NativeModules;

export default function DetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [app, setApp] = useState<AndroidApp | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const scale = useSharedValue(0.95);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);

  useEffect(() => {
    loadApp();
    animateIn();
  }, [id]);

  const animateIn = () => {
    scale.value = withSpring(1, { damping: 25, stiffness: 80 });
    opacity.value = withTiming(1, { duration: 600 });
    translateY.value = withSpring(0, { damping: 30, stiffness: 70 });
  };

  const animateOut = (callback: () => void) => {
    scale.value = withSpring(0.95, { damping: 25, stiffness: 80 });
    opacity.value = withTiming(0, { duration: 400 }, () => {
      runOnJS(callback)();
    });
  };

  const loadApp = async () => {
    try {
      const { data, error } = await supabase
        .from('android_apps')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('App no encontrada');

      setApp(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar la app');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    animateOut(() => {
      router.back();
    });
  };

  const handleOpenApp = async () => {
    if (!app) return;

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
        'El módulo AppLauncher no está disponible. Asegúrate de haber:\n\n1. Creado los archivos AppLauncherModule.kt y AppLauncherPackage.kt\n2. Registrado el package en MainApplication.kt\n3. Recompilado la app con: npx expo run:android'
      );
      return;
    }

    try {
      console.log('Intentando abrir app:', app.package_name);
      await AppLauncher.launchApp(app.package_name);
      console.log('App abierta exitosamente');
    } catch (err: any) {
      console.error('Error abriendo app:', err);
      
      const errorMessage = err.code === 'APP_NOT_FOUND' 
        ? `La aplicación "${app.titulo}" no está instalada en el dispositivo.`
        : `Error al abrir "${app.titulo}": ${err.message || 'Error desconocido'}`;
      
      Alert.alert(
        'No se pudo abrir',
        `${errorMessage}\n\nPackage: ${app.package_name}`,
        [{ text: 'OK', style: 'cancel' }]
      );
    }
  };

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (loading || !app) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#0a0a0a', '#1a1a2e', '#0a0a0a']}
          style={styles.gradient}
        />
        <View style={styles.centerContent}>
          <Text style={styles.loadingText}>
            {loading ? 'Cargando...' : error || 'App no encontrada'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a0a0a', '#1a1a2e', '#16213e', '#0a0a0a']}
        style={styles.gradient}
      />

      <Pressable onPress={handleBack} style={styles.backButton}>
        <View style={styles.backButtonInner}>
          <ArrowLeft size={24} color="#fff" />
        </View>
      </Pressable>

      <Animated.View style={[styles.content, containerStyle]}>
        <Animated.View style={contentStyle}>
          <View style={styles.iconWrapper}>
            <View style={styles.iconGlow} />
            <Image source={{ uri: app.icono_url }} style={styles.appIcon} />
          </View>

          <Text style={styles.title}>{app.titulo}</Text>
          <Text style={styles.packageName}>{app.package_name}</Text>

          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionLabel}>Descripción</Text>
            <Text style={styles.description}>{app.descripcion_larga}</Text>
          </View>

          <Pressable onPress={handleOpenApp} style={styles.openButton}>
            <LinearGradient
              colors={['#3b82f6', '#8b5cf6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.openButtonGradient}>
              <ExternalLink size={24} color="#fff" />
              <Text style={styles.openButtonText}>Abrir Aplicación</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
  },
  backButtonInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  iconWrapper: {
    position: 'relative',
    marginBottom: 30,
  },
  iconGlow: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
    borderRadius: 80,
    opacity: 0.6,
  },
  appIcon: {
    width: 120,
    height: 120,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  packageName: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    marginBottom: 40,
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace', default: 'monospace' }),
  },
  descriptionContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 40,
  },
  descriptionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.6)',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 24,
  },
  openButton: {
    width: '100%',
    height: 60,
    borderRadius: 16,
    overflow: 'hidden',
  },
  openButtonGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  openButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.7)',
  },
});