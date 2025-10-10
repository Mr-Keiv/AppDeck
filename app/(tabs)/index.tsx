import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, StatusBar, Dimensions, ImageBackground } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { supabase } from '@/lib/supabase';
import { AndroidApp } from '@/types/app';
import AppCarousel from '../detail/appCarousel';
import { WheelOfFortune } from '@/components/WheelFortune';
import AsyncStorage from '@react-native-async-storage/async-storage';

const APPS_CACHE_KEY = '@apps_cache';

export default function HomeScreen() {
  const [apps, setApps] = useState<AndroidApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<Video>(null);

  useEffect(() => {
    loadApps();
  }, []);

  const loadApps = async () => {
    try {
      // Try to get cached apps first
      const cachedApps = await AsyncStorage.getItem(APPS_CACHE_KEY);
      if (cachedApps) {
        setApps(JSON.parse(cachedApps));
        setLoading(false);
      }

      // Fetch fresh data in the background
      const { data, error } = await supabase
        .from('android_apps')
        .select('*')
        .eq('activo', true)
        .order('titulo', { ascending: true });

      if (error) throw error;

      // Update state and cache with fresh data
      const freshApps = data || [];
      setApps(freshApps);
      await AsyncStorage.setItem(APPS_CACHE_KEY, JSON.stringify(freshApps));
    } catch (err) {
      // Only set error if we don't have cached data
      const cachedApps = await AsyncStorage.getItem(APPS_CACHE_KEY);
      if (!cachedApps) {
        setError(err instanceof Error ? err.message : 'Error al cargar las apps');
      }
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return (
      <View style={styles.container}>
        <Video
          ref={videoRef}
          source={require('../../assets/images/fondo.mp4')}
          style={styles.backgroundVideo}
          resizeMode={ResizeMode.COVER}
          shouldPlay
          isLooping
          isMuted
        />
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#8b5cf6" />
          <Text style={styles.loadingText}>Cargando aplicaciones...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Video
          ref={videoRef}
          source={require('../../assets/images/fondo.mp4')}
          style={styles.backgroundVideo}
          resizeMode={ResizeMode.COVER}
          shouldPlay
          isLooping
          isMuted
        />
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  if (apps.length === 0) {
    return (
      <View style={styles.container}>
        <Video
          ref={videoRef}
          source={require('../../assets/images/fondo.mp4')}
          style={styles.backgroundVideo}
          resizeMode={ResizeMode.COVER}
          shouldPlay
          isLooping
          isMuted
        />
        <View style={styles.centerContent}>
          <Text style={styles.emptyText}>No hay aplicaciones disponibles</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Video
        ref={videoRef}
        source={require('../../assets/images/fondo.mp4')}
        style={styles.backgroundVideo}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping
        isMuted
      />
      <ImageBackground
        source={require('../../assets/images/banner.png')}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: "100%",
          zIndex: 0,
          marginTop: -50

        }}
        resizeMode="contain"
      />


      {/* Carrusel centrado */}
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
        marginTop: 450,
        marginBottom: -600,
      }}>
        <AppCarousel apps={apps} />
      </View>
      {/* Ruleta abajo */}
      <View style={styles.wheelSection}>
        <WheelOfFortune />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
    textShadowColor: 'rgba(139, 92, 246, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  headerUnderline: {
    width: 80,
    height: 4,
    backgroundColor: '#8b5cf6',
    borderRadius: 2,
    marginBottom: 12,
  },
  headerSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
  wheelSection: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 0,
  },
  wheelTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  wheelSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 20,
  },
});