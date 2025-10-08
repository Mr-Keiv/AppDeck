import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, StatusBar, TouchableOpacity, Animated, Easing, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/lib/supabase';
import { AndroidApp } from '@/types/app';
import AppCarousel from '../detail/appCarousel';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Distribución específica: 3x GANASTE, 4x SIGUE INTENTANDO, 2x RETO
const wheelSegments = [
  { text: 'GANASTE', type: 'ganaste', color: '#00a651' }, // Verde
  { text: 'SIGUE INTENTANDO', type: 'sigue_intentando', color: '#e30613' }, // Rojo
  { text: 'RETO', type: 'reto', color: '#0f065a' }, // Azul oscuro
  { text: 'GANASTE', type: 'ganaste', color: '#00a651' },
  { text: 'SIGUE INTENTANDO', type: 'sigue_intentando', color: '#e30613' },
  { text: 'SIGUE INTENTANDO', type: 'sigue_intentando', color: '#e30613' },
  { text: 'RETO', type: 'reto', color: '#0f065a' },
  { text: 'GANASTE', type: 'ganaste', color: '#00a651' },
  { text: 'SIGUE INTENTANDO', type: 'sigue_intentando', color: '#e30613' }
];

export default function HomeScreen() {
  const [apps, setApps] = useState<AndroidApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [winnerValue, setWinnerValue] = useState<string | null>(null);
  const [winnerIndex, setWinnerIndex] = useState<number | null>(null);
  const [started, setStarted] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const spinValue = useRef(new Animated.Value(0)).current;
  
  // Tamaño de la ruleta
  const wheelSize = Math.min(screenWidth * 0.85, 350);
  const segmentSize = 360 / wheelSegments.length;
  
  // Interpolate rotation with spin value
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  useEffect(() => {
    loadApps();
  }, []);

  const loadApps = async () => {
    try {
      const { data, error } = await supabase
        .from('android_apps')
        .select('*')
        .eq('activo', true)
        .order('titulo', { ascending: true });

      if (error) throw error;

      setApps(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar las apps');
    } finally {
      setLoading(false);
    }
  };

  const buttonPress = () => {
    if (spinning) return;
    
    setStarted(true);
    setSpinning(true);
    setWinnerIndex(null);
    setWinnerValue(null);
    
    // Reset animation value
    spinValue.setValue(0);
    
    // Random number of spins
    const numOfSpins = 5 + Math.random() * 5;
    
    // Start spinning animation
    Animated.timing(spinValue, {
      toValue: numOfSpins,
      duration: 4000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true
    }).start(() => {
      setSpinning(false);
      
      // Calculate winner based on final rotation
      const totalDegrees = numOfSpins * 360;
      const normalizedDegrees = totalDegrees % 360;
      const winnerIdx = Math.floor(normalizedDegrees / segmentSize);
      
      // Adjust for wheel orientation
      const adjustedWinnerIdx = (wheelSegments.length - winnerIdx) % wheelSegments.length;
      
      setWinnerIndex(adjustedWinnerIdx);
      setWinnerValue(wheelSegments[adjustedWinnerIdx].text);
    });
  };
  
  const tryAgain = () => {
    setWinnerIndex(null);
    setWinnerValue(null);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#0f065a', '#1a1a2e', '#16213e']}
          style={styles.gradient}
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
        <LinearGradient
          colors={['#0a0a0a', '#1a1a2e', '#16213e']}
          style={styles.gradient}
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
        <LinearGradient
          colors={['#0a0a0a', '#1a1a2e', '#16213e']}
          style={styles.gradient}
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
      <LinearGradient
        colors={['#0a0a0a', '#1a1a2e', '#16213e']}
        style={styles.gradient}
      />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Catálogo Disglobal</Text>
        <View style={styles.headerUnderline} />
        <Text style={styles.headerSubtitle}>
          Desliza para explorar nuestras aplicaciones
        </Text>
      </View>

      <AppCarousel apps={apps} />

      <View style={styles.wheelSection}>
        <Text style={styles.wheelTitle}>RULETA DE PREMIOS</Text>
        <Text style={styles.wheelSubtitle}>Gira para descubrir tu resultado</Text>
        
        <View style={[styles.wheelWrapper, { width: wheelSize + 40, height: wheelSize + 80 }]}>
          {/* Marcador de posición */}
          <View style={styles.wheelPointerContainer}>
            <View style={styles.wheelPointer}>
              <View style={styles.pointerTriangle} />
            </View>
          </View>

          {/* Ruleta */}
          <Animated.View
            style={[
              styles.wheel,
              { 
                width: wheelSize, 
                height: wheelSize,
                borderRadius: wheelSize / 2,
                transform: [{ rotate: spin }],
              }
            ]}
          >
            {/* Segmentos de la ruleta */}
            {wheelSegments.map((segment, index) => {
              const angle = index * segmentSize;
              
              return (
                <View
                  key={index}
                  style={[
                    styles.segmentContainer,
                    { 
                      width: wheelSize, 
                      height: wheelSize,
                      transform: [{ rotate: `${angle}deg` }] 
                    }
                  ]}
                >
                  <View
                    style={[
                      styles.segment,
                      {
                        width: wheelSize / 2,
                        height: wheelSize / 2,
                        backgroundColor: segment.color,
                        transform: [{ rotate: `${segmentSize / 2}deg` }],
                      }
                    ]}
                  />
                  <View style={styles.textContainer}>
                    <Text
                      style={[
                        styles.wheelSegmentText,
                        {
                          transform: [
                            { rotate: `-${angle}deg` },
                            { rotate: `${segmentSize / 2}deg` }
                          ],
                        }
                      ]}
                      numberOfLines={1}
                    >
                      {segment.text}
                    </Text>
                  </View>
                </View>
              );
            })}
            
            {/* Centro de la ruleta */}
            <View style={[styles.wheelCenter, { 
              width: wheelSize * 0.15, 
              height: wheelSize * 0.15,
              borderRadius: (wheelSize * 0.15) / 2,
            }]}>
              <Text style={styles.centerText}>DISGLOBAL</Text>
            </View>

            {/* Líneas divisorias entre segmentos */}
            {wheelSegments.map((_, index) => {
              const angle = index * segmentSize;
              return (
                <View
                  key={`line-${index}`}
                  style={[
                    styles.dividerLine,
                    {
                      transform: [{ rotate: `${angle}deg` }],
                      height: wheelSize / 2,
                    }
                  ]}
                />
              );
            })}
          </Animated.View>
        </View>
        
        {/* Controles y resultados */}
        <View style={styles.controlsContainer}>
          {!spinning && winnerIndex === null && (
            <TouchableOpacity 
              onPress={buttonPress} 
              style={styles.spinButton}
              activeOpacity={0.8}
            >
              <Text style={styles.spinButtonText}>GIRAR RULETA</Text>
            </TouchableOpacity>
          )}
          
          {spinning && (
            <View style={styles.spinningContainer}>
              <ActivityIndicator size="large" color="#8b5cf6" />
              <Text style={styles.spinningText}>La ruleta está girando...</Text>
            </View>
          )}
          
          {winnerIndex !== null && (
            <View style={styles.resultContainer}>
              <Text style={styles.resultTitle}>RESULTADO</Text>
              <View style={[styles.winnerBadge, { backgroundColor: wheelSegments[winnerIndex].color }]}>
                <Text style={styles.winnerText}>{wheelSegments[winnerIndex].text}</Text>
              </View>
              <Text style={styles.resultDescription}>
                {wheelSegments[winnerIndex].type === 'ganaste' 
                  ? '¡Felicidades! Has resultado ganador.' 
                  : wheelSegments[winnerIndex].type === 'reto'
                  ? 'Te ha tocado completar un reto.'
                  : 'Sigue participando en próximas oportunidades.'
                }
              </Text>
              <TouchableOpacity
                onPress={tryAgain}
                style={styles.tryAgainButton}
                activeOpacity={0.8}
              >
                <Text style={styles.tryAgainText}>VOLVER A JUGAR</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

   
      </View>
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
    paddingTop: 10,
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
  wheelWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 20,
  },
  wheel: {
    borderWidth: 4,
    borderColor: '#8b5cf6',
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: 'transparent',
  },
  segmentContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  segment: {
    position: 'absolute',
    top: 0,
    left: '50%',
    transformOrigin: 'bottom left',
    overflow: 'hidden',
  },
  textContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wheelSegmentText: {
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
    width: 80,
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  wheelCenter: {
    position: 'absolute',
    backgroundColor: '#fff',
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -((screenWidth * 0.85 * 0.15) / 4) }, { translateY: -((screenWidth * 0.85 * 0.15) / 4) }],
  },
  centerText: {
    color: '#0a0a0a',
    fontWeight: 'bold',
    fontSize: 10,
    textAlign: 'center',
  },
  dividerLine: {
    position: 'absolute',
    width: 2,
    backgroundColor: '#fff',
    left: '50%',
    top: 0,
    transformOrigin: 'bottom center',
    zIndex: 5,
  },
  wheelPointerContainer: {
    position: 'absolute',
    top: -10,
    zIndex: 20,
    alignItems: 'center',
  },
  wheelPointer: {
    alignItems: 'center',
  },
  pointerTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 15,
    borderRightWidth: 15,
    borderBottomWidth: 25,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#ffd700',
  },
  controlsContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    width: '100%',
    marginBottom: 20,
  },
  spinButton: {
    backgroundColor: '#8b5cf6',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
  },
  spinButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  spinningContainer: {
    alignItems: 'center',
    padding: 20,
  },
  spinningText: {
    fontSize: 16,
    color: '#8b5cf6',
    fontWeight: 'bold',
    marginTop: 10,
  },
  resultContainer: {
    width: '90%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  winnerBadge: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 10,
    minWidth: 200,
  },
  winnerText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  resultDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginVertical: 10,
    lineHeight: 20,
  },
  tryAgainButton: {
    backgroundColor: '#8b5cf6',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 10,
  },
  tryAgainText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  statsContainer: {
    width: '90%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  statsTitle: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    justifyContent: 'center',
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
});