/**
 * Direct port of `lib/widgets/typing_indicator.dart`.
 * Three dots with a fading opacity, animated via react-native-reanimated
 * to mirror the Flutter `AnimationController..repeat()` with staggered
 * `Interval(i*0.2, 0.6+i*0.2)` curves.
 */
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  useAnimatedReaction,
  Easing,
} from 'react-native-reanimated';
import { colors, radii } from '../config/theme';

const DOT_SIZE = 8;
const PERIOD = 1000;
const STAGGER = 200;

function useDotAnimation(active: boolean, index: number) {
  const opacity = useSharedValue(active ? 0.2 : 0);
  React.useEffect(() => {
    if (!active) {
      opacity.value = withTiming(0.2, { duration: 100 });
      return;
    }
    // each dot cycles 0.2 -> 1.0 -> 0.2 with `PERIOD` ms period, offset by `STAGGER * index`
    let raf: ReturnType<typeof setTimeout>;
    const loop = () => {
      opacity.value = withSequence(
        withTiming(1.0, { duration: 400, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.2, { duration: PERIOD - 400, easing: Easing.inOut(Easing.ease) })
      );
      raf = setTimeout(loop, PERIOD);
    };
    raf = setTimeout(loop, STAGGER * index);
    return () => clearTimeout(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, index]);
  return useAnimatedStyle<ViewStyle>(() => ({ opacity: opacity.value }));
}

interface Props {
  active?: boolean;
}

export const TypingIndicator: React.FC<Props> = ({ active = true }) => {
  const s1 = useDotAnimation(active, 0);
  const s2 = useDotAnimation(active, 1);
  const s3 = useDotAnimation(active, 2);
  const styles = [s1, s2, s3];
  return (
    <View style={local.container}>
      {styles.map((a, i) => (
        <Animated.View key={i} style={[local.dot, a]} />
      ))}
    </View>
  );
};

const local = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.bgSurfaceContainerHighest,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    borderBottomRightRadius: radii.lg,
    borderBottomLeftRadius: 4,
    alignSelf: 'flex-start',
  } as ViewStyle,
  dot: {
    marginHorizontal: 2,
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: colors.text_highEmphasis,
  } as ViewStyle,
});

// silence unused import warning for useAnimatedReaction kept for potential timing tweaks
void useAnimatedReaction;
