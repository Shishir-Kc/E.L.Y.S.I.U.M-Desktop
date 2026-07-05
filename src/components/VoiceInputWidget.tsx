/**
 * Recording waveform widget — direct port of `lib/widgets/voice_input_widget.dart`.
 *
 * Shows a 80-bar waveform driven by `waveAmplitudeFromChunk`. Cancel/X and
 * Confirm/check buttons are wired to the parent via `onCancel` / `onCompleted`
 * callbacks. Uses the WebAudioEngine or NativeAudioEngine to capture PCM.
 *
 * Unlike the Flutter version which kept an in-memory BytesBuilder and emitted a
 * complete WAV at the end, this RN version keeps its own rolling Uint8Array
 * for raw PCM. The audio engines differ on whether they preserve raw PCM
 * natively; we keep it here for portability.
 */
import React from 'react';
import { StyleSheet, View, ViewStyle, Pressable, Animated as RNAnimated } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors, radii } from '../config/theme';
import { getAudioEngine } from '../audio/audioEngine';
import { BytesBuilder } from '../utils/audioBuffer';
import { waveAmplitudeFromChunk } from '../utils/vad';
import { buildWav } from '../utils/wav';

const BAR_COUNT = 80;

interface Props {
  onCancel: () => void;
  onCompleted: (wav: Uint8Array) => void;
}

export const VoiceInputWidget: React.FC<Props> = ({ onCancel, onCompleted }) => {
  const [amplitudes] = React.useState<number[]>(() => new Array(BAR_COUNT).fill(5));
  const amplitudesRef = React.useRef(amplitudes);
  amplitudesRef.current = amplitudes;
  const [barAnim] = React.useState(() =>
    Array.from({ length: BAR_COUNT }, () => new RNAnimated.Value(5))
  );
  const bufferRef = React.useRef<BytesBuilder>(new BytesBuilder());
  const stoppedRef = React.useRef(false);

  React.useEffect(() => {
    let disposed = false;
    (async () => {
      try {
        const engine = await getAudioEngine();
        const ok = await engine.requestPermission();
        if (!ok) {
          onCancel();
          return;
        }
        await engine.startRecording({
          onChunk: (pcm) => {
            bufferRef.current.add(pcm);
            const a = waveAmplitudeFromChunk(pcm);
            const height = 5 + a * 50;
            const arr = amplitudesRef.current;
            const next = arr.slice(1);
            next.push(height);
            amplitudesRef.current = next;
            // animate the last few bars so it looks alive without re-rendering all 80
            for (let i = 0; i < BAR_COUNT; i++) {
              RNAnimated.timing(barAnim[i], {
                toValue: next[i],
                duration: 80,
                useNativeDriver: false,
              }).start();
            }
          },
        });
      } catch (e) {
        console.warn('voice record failed:', e);
        if (!disposed) onCancel();
      }
    })();
    return () => {
      disposed = true;
      void stopAndDiscard();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function stopAndSend(): Promise<void> {
    if (stoppedRef.current) return;
    stoppedRef.current = true;
    try {
      const engine = await getAudioEngine();
      const pcm = await engine.stopRecording();
      const raw = bufferRef.current.toBytes();
      const rawPcm = pcm.length > 0 ? pcm : raw;
      if (rawPcm.length === 0) {
        onCancel();
        return;
      }
      const wav = buildWav(rawPcm);
      onCompleted(wav);
    } catch (e) {
      console.warn('stopAndSend failed:', e);
      onCancel();
    }
  }

  async function stopAndDiscard(): Promise<void> {
    if (stoppedRef.current) return;
    stoppedRef.current = true;
    try {
      const engine = await getAudioEngine();
      await engine.stopRecording();
    } catch {
      // ignore
    }
    onCancel();
  }

  return (
    <View style={local.container}>
      <Pressable onPress={() => void stopAndDiscard()} style={local.iconBtn}>
        <MaterialIcons name="add" color={colors.text_lowEmphasis} size={20} />
      </Pressable>
      <View style={local.waveRow}>
        {barAnim.map((v, i) => (
          <RNAnimated.View
            key={i}
            style={[
              local.bar,
              {
                height: v,
              },
            ]}
          />
        ))}
      </View>
      <Pressable onPress={() => void stopAndDiscard()} style={local.iconBtn}>
        <MaterialIcons name="close" color={colors.text_medEmphasis} size={20} />
      </Pressable>
      <Pressable onPress={() => void stopAndSend()} style={local.iconBtn}>
        <MaterialIcons name="check" color={colors.text_primary} size={20} />
      </Pressable>
    </View>
  );
};

const local = StyleSheet.create({
  container: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: colors.bgUserBubble,
    borderRadius: 30,
  } as ViewStyle,
  iconBtn: {
    padding: 4,
  } as ViewStyle,
  waveRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12,
  } as ViewStyle,
  bar: {
    width: 3,
    marginHorizontal: 1,
    backgroundColor: colors.text_primary,
    borderRadius: radii.sm,
  } as ViewStyle,
});
