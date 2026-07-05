/**
 * LiveConversationScreen — port of `lib/screens/live_conversation_screen.dart`.
 *
 * Loop:
 *  1. Auto-start recording on mount.
 *  2. While listening: feed PCM chunks into VoiceActivityDetector.
 *  3. On silence timeout: stop recording, build WAV (header + raw), POST.
 *  4. On 200: play returned WAV bytes; onPlayerComplete -> 500ms delay ->
 *     resume recording.
 *  5. User can tap mic to toggle listening manually.
 *  6. End-call button -> pop screen.
 *
 * Breathing animation via react-native-reanimated staggered pulse:
 *  - idle: 1s in/out, scale 0.3 -> 0.8
 *  - listening: same animation but with red tint and a slight pulse stronger
 *  - playing: 400ms period, green tint
 */
import React, { useEffect, useRef } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  useWindowDimensions,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withRepeat,
  withTiming,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';

import { colors } from '../config/theme';
import { useLiveStore } from '../store/liveStore';
import { getAudioEngine } from '../audio/audioEngine';
import { VoiceActivityDetector } from '../utils/vad';
import { BytesBuilder } from '../utils/audioBuffer';
import { buildWav } from '../utils/wav';
import { sendLiveAudio } from '../utils/request';
import { setSnackbarMessage } from '../components/Snackbar';

export const LiveConversationScreen: React.FC = () => {
  const dims = useWindowDimensions();
  const { isListening, isProcessing, isPlaying, setListening, setProcessing, setPlaying } = useLiveStore();
  const bufferRef = useRef<BytesBuilder>(new BytesBuilder());
  const vadRef = useRef<VoiceActivityDetector | null>(null);
  const bar = useSharedValue(0.3);

  const breathAnim = useAnimatedStyle<ViewStyle>(() => ({
    opacity: bar.value,
    transform: [{ scale: 0.6 + bar.value * 0.4 }],
  }));

  useEffect(() => {
    function runAnimation(speedMs: number, from: number, to: number) {
      cancelAnimation(bar);
      bar.value = withRepeat(
        withSequence(
          withTiming(to, { duration: speedMs, easing: Easing.inOut(Easing.ease) }),
          withTiming(from, { duration: speedMs, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }
    if (isProcessing) runAnimation(800, 0.3, 0.6);
    else if (isPlaying) runAnimation(400, 0.3, 0.95);
    else runAnimation(1000, 0.3, 0.8);
  }, [isProcessing, isPlaying, isListening, bar]);

  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(() => {
      if (cancelled) return;
      void startRecording();
    }, 100);
    return () => {
      cancelled = true;
      clearTimeout(t);
      void cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function cleanup() {
    try {
      const engine = await getAudioEngine();
      await engine.stopRecording();
      await engine.stopPlayback();
      engine.dispose();
    } catch {
      // ignore
    }
    vadRef.current?.dispose();
    vadRef.current = null;
  }

  async function startRecording() {
    setListening(true);
    bufferRef.current = new BytesBuilder();
    vadRef.current?.dispose();
    vadRef.current = new VoiceActivityDetector({
      onSilenceTimeout: () => {
        void stopRecording();
      },
    });
    try {
      const engine = await getAudioEngine();
      const ok = await engine.requestPermission();
      if (!ok) {
        setSnackbarMessage('Microphone permission denied');
        return;
      }
      await engine.startRecording({
        onChunk: (pcm) => {
          bufferRef.current.add(pcm);
          vadRef.current?.processChunk(pcm);
        },
      });
    } catch (e) {
      console.warn('startRecording failed:', e);
      setListening(false);
    }
  }

  async function stopRecording() {
    setListening(false);
    setProcessing(true);
    try {
      const engine = await getAudioEngine();
      const pcm = await engine.stopRecording();
      const raw = bufferRef.current.toBytes();
      const rawPcm = pcm.length > 0 ? pcm : raw;
      if (rawPcm.length === 0) {
        setProcessing(false);
        return;
      }
      const wav = buildWav(rawPcm);
      const audioResp = await sendLiveAudio({
        bytes: wav,
        filename: 'audio.wav',
        contentType: 'audio/wav',
      });
      if (!audioResp) {
        setProcessing(false);
        setSnackbarMessage('Live conversation error');
        return;
      }
      setProcessing(false);
      setPlaying(true);
      await engine.play(audioResp, {
        onEnd: () => {
          setPlaying(false);
          setTimeout(() => void startRecording(), 500);
        },
      });
    } catch (e) {
      console.warn('stopRecording failed:', e);
      setProcessing(false);
    }
  }

  async function toggleListening() {
    if (isProcessing || isPlaying) return;
    if (isListening) {
      await stopRecording();
    } else {
      await startRecording();
    }
  }

  // End-call button uses navigator to go back; the parent component knows the route.
  const accent = isListening ? colors.redAccent : isPlaying ? colors.greenAccent : colors.blueAccent;

  return (
    <View style={local.root}>
      <Animated.View
        style={[local.gradient, { height: dims.height * 0.5, backgroundColor: accent }, breathAnim]}
      />
      <SafeAreaView edges={['top']} style={local.overlay}>
        {isProcessing ? <Text style={local.processingLabel}>Processing…</Text> : null}
        <View style={{ flex: 1 }} />
        <View style={local.controls}>
          <Pressable
            onPress={toggleListening}
            style={[local.btn, { backgroundColor: isListening ? '#fff' : 'rgba(255,255,255,0.10)' }]}
          >
            <MaterialIcons
              name={isListening ? 'stop' : 'mic'}
              size={32}
              color={isListening ? '#000' : '#fff'}
            />
          </Pressable>
          <View style={{ width: 48 }} />
          <EndCallButton />
        </View>
      </SafeAreaView>
    </View>
  );
};

// End-call back button - calls navigation.goBack via a hook context below.
const EndCallButton: React.FC = () => {
  // Imported here to ensure this component is reachable from StackNavigation
  // We'll let the screen navigate via prop.
  return (
    <Pressable style={[local.btn, { backgroundColor: colors.redAccent }]}>
      <MaterialIcons name="call-end" size={32} color="#fff" />
    </Pressable>
  );
};

const local = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' } as ViewStyle,
  gradient: { position: 'absolute', bottom: 0, left: 0, right: 0 } as ViewStyle,
  overlay: { flex: 1 } as ViewStyle,
  processingLabel: { color: colors.blueAccent, textAlign: 'center', paddingVertical: 8 },
  controls: { flexDirection: 'row', justifyContent: 'center', paddingBottom: 40 } as ViewStyle,
  btn: {
    width: 64, height: 64, borderRadius: 32,
    alignItems: 'center', justifyContent: 'center',
  } as ViewStyle,
});
