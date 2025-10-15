import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import { Video, ResizeMode } from 'expo-av';

interface VideoBackgroundProps {
  onTouch: () => void;
}

const VideoBackground: React.FC<VideoBackgroundProps> = ({ onTouch }) => {
  const videoRef = useRef(null);
  const [currentVideo, setCurrentVideo] = useState(0);
  const [playCount, setPlayCount] = useState(0);

  // Definimos la secuencia de videos
  const videoSequence = [
    { source: require('../assets/disgogss.mp4'), repeats: 1 },
    //{ source: require('../assets/bg-video.mp4'), repeats: 1 },
  ];

  // Maneja el evento cuando un video termina
  const handleVideoEnd = async () => {
    const newPlayCount = playCount + 1;
    setPlayCount(newPlayCount);

    // Verificamos si este video ya se reprodujo las veces requeridas
    if (newPlayCount >= videoSequence[currentVideo].repeats) {
      // Pasamos al siguiente video en la secuencia
      const nextVideo = (currentVideo + 1) % videoSequence.length;
      setCurrentVideo(nextVideo);
      setPlayCount(0);
    }

    // Reiniciamos el video y lo reproducimos de nuevo
    if (videoRef.current) {
      await (videoRef.current as Video).replayAsync();
    }
  };

  useEffect(() => {
    // Cuando cambia el video actual, aseguramos que se reinicie la reproducción
    if (videoRef.current) {
(videoRef.current as Video).replayAsync();
    }
  }, [currentVideo]);

  return (
    <TouchableWithoutFeedback onPress={onTouch}>
      <View style={styles.container}>
        <Video
          ref={videoRef}
          source={videoSequence[currentVideo].source}
          rate={1.0}
          volume={1.0}
          isMuted={true}
          resizeMode={ResizeMode.COVER}
          shouldPlay
          isLooping={false} // Cambiamos a false para controlar manualmente la secuencia
          style={styles.video}
          onPlaybackStatusUpdate={(status) => {
            if (!status.isLoaded || status.isLoaded && status.didJustFinish) {
              handleVideoEnd();
            }
          }}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f065a',
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
});

export default VideoBackground;