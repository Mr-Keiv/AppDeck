import { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, FlatList } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import { AndroidApp } from '@/types/app';
import AppCard from './appCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.4;
const CARD_SPACING = 20;
const AUTO_SCROLL_INTERVAL = 4000;

interface AppCarouselProps {
  apps: AndroidApp[];
}

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<AndroidApp>);

export default function AppCarousel({ apps }: AppCarouselProps) {
  const scrollX = useSharedValue(0);
  const flatListRef = useRef<FlatList<AndroidApp>>(null);
  const currentIndex = useRef(0);
  const autoScrollTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);

  const extendedApps = apps.length > 0 ? [...apps, ...apps, ...apps] : [];

  useEffect(() => {
    if (apps.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: apps.length,
          animated: false,
        });
      }, 100);
    }
  }, [apps.length]);

  useEffect(() => {
    if (apps.length === 0) return;

    const startAutoScroll = () => {
      autoScrollTimer.current = setInterval(() => {
        if (!isUserScrolling) {
          const nextIndex = currentIndex.current + 1;
          flatListRef.current?.scrollToIndex({
            index: nextIndex,
            animated: true,
          });
          currentIndex.current = nextIndex;
        }
      }, AUTO_SCROLL_INTERVAL);
    };

    startAutoScroll();

    return () => {
      if (autoScrollTimer.current) {
        clearInterval(autoScrollTimer.current);
      }
    };
  }, [apps.length, isUserScrolling]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const getItemLayout = (_: any, index: number) => ({
    length: CARD_WIDTH + CARD_SPACING,
    offset: (CARD_WIDTH + CARD_SPACING) * index,
    index,
  });

  const onScrollBeginDrag = () => {
    setIsUserScrolling(true);
  };

  const onMomentumScrollEnd = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / (CARD_WIDTH + CARD_SPACING));

    if (index < apps.length) {
      flatListRef.current?.scrollToIndex({
        index: index + apps.length,
        animated: false,
      });
      currentIndex.current = index + apps.length;
    } else if (index >= apps.length * 2) {
      flatListRef.current?.scrollToIndex({
        index: index - apps.length,
        animated: false,
      });
      currentIndex.current = index - apps.length;
    } else {
      currentIndex.current = index;
    }

    setTimeout(() => {
      setIsUserScrolling(false);
    }, 500);
  };

  const renderItem = ({ item, index }: { item: AndroidApp; index: number }) => (
    <AppCard app={item} index={index} scrollX={scrollX} />
  );

  if (apps.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <AnimatedFlatList
        ref={flatListRef}
        data={extendedApps}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + CARD_SPACING}
        decelerationRate="fast"
        contentContainerStyle={styles.contentContainer}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onScrollBeginDrag={onScrollBeginDrag}
        onMomentumScrollEnd={onMomentumScrollEnd}
        getItemLayout={getItemLayout}
        initialScrollIndex={apps.length}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: (SCREEN_WIDTH - CARD_WIDTH) / 2 - CARD_SPACING / 2,
  },
});
