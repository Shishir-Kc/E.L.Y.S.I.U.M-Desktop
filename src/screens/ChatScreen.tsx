/**
 * ChatScreen — main screen of the app. Direct port of
 * `lib/screens/chat_screen.dart` (the build method and all sub-routines).
 *
 * Layout:
 *  <Row>
 *    [Sidebar  -> DrawerContent on phones]
 *    <Column>
 *      <GreetingOverlay />
 *      <MessageList />  (FlatList with typing indicator footer)
 *      <Snackbar />
 *      <InputBar /> OR <VoiceInputWidget />
 *    </Column>
 *  </Row>
 *
 * Keyboard shortcuts (web only):
 *  Ctrl+Enter   -> send
 *  Ctrl+Shift+O -> clear
 *  Ctrl+B       -> toggle sidebar (kept Ctrl+B to avoid stealing Ctrl+C copy)
 *
 * The original Flutter app used Ctrl+C to toggle. Per the plan, we map it to
 * Ctrl+B on web so the user can still copy text.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createDrawerNavigator, DrawerContentComponentProps } from '@react-navigation/drawer';
import { useNavigation, DrawerActions } from '@react-navigation/native';

const DrawerNav = createDrawerNavigator();

import { colors, fonts, fontWeights } from '../config/theme';
import { Sidebar } from '../components/Sidebar';
import { MessageBubble } from '../components/MessageBubble';
import { TypingIndicator } from '../components/TypingIndicator';
import { VoiceInputWidget } from '../components/VoiceInputWidget';
import { ModelSelectorModal } from '../components/ModelSelectorModal';
import { SettingsModal } from '../components/SettingsModal';
import { ToolsMenu } from '../components/ToolsMenu';
import { InputBar } from '../components/InputBar';
import { Snackbar } from '../components/Snackbar';

import { useChatStore } from '../store/chatStore';
import { useUIStore, SidebarItemId } from '../store/uiStore';
import { ChatMessage } from '../types/chat';
import { modelDisplayName } from '../config/models';

const ChatInner: React.FC = () => {
  const navigation = useNavigation<any>();
  const dimensions = useWindowDimensionsHook();
  const isPhone = dimensions.width < 768;

  const messages = useChatStore((s) => s.messages);
  const isTyping = useChatStore((s) => s.isTyping);
  const isTranscribing = useChatStore((s) => s.isTranscribing);
  const isRecording = useChatStore((s) => s.isRecording);
  const greeting = useChatStore((s) => s.greeting);
  const draft = useChatStore((s) => s.draftText);
  const selectedModel = useChatStore((s) => s.selectedModel);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const clearChat = useChatStore((s) => s.clearChat);
  const setModel = useChatStore((s) => s.setModel);
  const setDraft = useChatStore((s) => s.setDraft);
  const setRecording = useChatStore((s) => s.setRecording);
  const transcribe = useChatStore((s) => s.transcribe);

  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const selectItem = useUIStore((s) => s.selectItem);

  const [showModelPicker, setShowModelPicker] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showTools, setShowTools] = useState(false);

  const listRef = useRef<FlatList<ChatMessage>>(null);
  const lastMsgId = useMemo(() => messages[messages.length - 1]?.id, [messages]);
  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollToEnd({ animated: true });
  }, [lastMsgId, isTyping]);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        void sendMessage(draft);
        return;
      }
      if (e.ctrlKey && e.shiftKey && (e.key === 'O' || e.key === 'o')) {
        e.preventDefault();
        clearChat();
        return;
      }
      if (e.ctrlKey && (e.key === 'b' || e.key === 'B')) {
        e.preventDefault();
        toggleSidebar();
        return;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [draft, sendMessage, clearChat, toggleSidebar]);

  function handleSidebarItem(id: SidebarItemId) {
    if (id === 'settings') { setShowSettings(true); return; }
    if (id === 'logs') { navigation.navigate('Logs'); return; }
    selectItem(id);
  }

  function renderMessage({ item }: { item: ChatMessage }) {
    return <MessageBubble message={item} maxWidth={dimensions.width * 0.85} />;
  }

  const data = [...messages];
  if (isTyping) data.push({ id: '__typing__', text: '', isUser: false, timestamp: 0, isThinking: true });

  return (
    <View style={local.root}>
      {isPhone ? null : <Sidebar onSelect={handleSidebarItem} />}
      <SafeAreaView edges={['top', 'left', 'right']} style={local.column}>
        {isPhone ? (
          <View style={local.phoneBar}>
            <Pressable onPress={() => navigation.dispatch(DrawerActions.openDrawer())} hitSlop={12}>
              <MaterialIcons name="menu" size={24} color={colors.text_medEmphasis} />
            </Pressable>
            <Text style={local.phoneBarTitle}>{modelDisplayName(selectedModel)}</Text>
            <Pressable onPress={() => setShowModelPicker(true)} hitSlop={12}>
              <MaterialIcons name="keyboard-arrow-down" size={24} color={colors.text_medEmphasis} />
            </Pressable>
          </View>
        ) : null}
        <View style={local.messageArea}>
          {messages.length === 0 ? (
            <View style={local.greetingOverlay}>
              <Text style={local.greetingText}>{greeting}</Text>
            </View>
          ) : null}
          <FlatList
            ref={listRef}
            data={data}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={{ paddingVertical: 8, paddingHorizontal: 16 }}
            ListFooterComponent={
              isTyping && messages.length > 0 ? (
                <View style={local.typingFooter}><TypingIndicator /></View>
              ) : null
            }
            onScrollToIndexFailed={() => {}}
          />
          <Snackbar />
        </View>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {isRecording ? (
            <View style={local.voiceSlot}>
              <VoiceInputWidget
                onCancel={() => setRecording(false)}
                onCompleted={(wav) => {
                  setRecording(false);
                  void transcribe({ bytes: wav, filename: 'audio.wav', contentType: 'audio/wav' });
                }}
              />
            </View>
          ) : (
            <InputBar
              draft={draft}
              draftActive={draft.trim().length > 0}
              isTyping={isTyping}
              isTranscribing={isTranscribing}
              isRecording={isRecording}
              selectedModelName={modelDisplayName(selectedModel)}
              onChangeDraft={setDraft}
              onSubmit={() => void sendMessage(draft)}
              onOpenModelPicker={() => setShowModelPicker(true)}
              onOpenTools={() => setShowTools(true)}
              onStartRecording={() => setRecording(true)}
              onCancelRecording={() => setRecording(false)}
              onOpenLiveConversation={() => navigation.navigate('LiveConversation')}
            />
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>

      <ModelSelectorModal
        visible={showModelPicker}
        onClose={() => setShowModelPicker(false)}
        onSelected={(id) => setModel(id)}
      />
      <SettingsModal visible={showSettings} onClose={() => setShowSettings(false)} />
      <ToolsMenu visible={showTools} onClose={() => setShowTools(false)} />
    </View>
  );
};

function useWindowDimensionsHook() {
  const [size, setSize] = useState(() => Dimensions.get('window'));
  useEffect(() => {
    const sub = Dimensions.addEventListener('change', (p: { window: typeof size }) => setSize(p.window));
    return () => sub.remove();
  }, []);
  return size;
}

const local = StyleSheet.create({
  root: { flex: 1, flexDirection: 'row', backgroundColor: colors.bgPrimary } as ViewStyle,
  column: { flex: 1, backgroundColor: colors.bgSurface } as ViewStyle,
  messageArea: { flex: 1, position: 'relative' } as ViewStyle,
  greetingOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 24,
  } as ViewStyle,
  greetingText: {
    color: colors.text_faint,
    fontFamily: fonts.display,
    fontSize: 24,
    fontWeight: fontWeights.medium,
    textAlign: 'center',
  },
  phoneBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    backgroundColor: colors.bgSurfaceVariant,
  } as ViewStyle,
  phoneBarTitle: {
    flex: 1,
    textAlign: 'center',
    color: colors.text_primary,
    fontFamily: fonts.body,
    fontWeight: fontWeights.medium,
  },
  typingFooter: { paddingVertical: 16, paddingHorizontal: 16 } as ViewStyle,
  voiceSlot: { padding: 16 } as ViewStyle,
});

void Keyboard;

export const ChatScreen: React.FC = () => {
  return (
    <DrawerNav.Navigator
      screenOptions={{ headerShown: false, drawerType: 'slide', drawerStyle: { width: 240 } }}
      drawerContent={(props: DrawerContentComponentProps) => (
        <Sidebar
          forcedExpanded
          onSelect={(id) => {
            if (id === 'settings') { props.navigation.closeDrawer(); return; }
            if (id === 'logs') { (props.navigation as any).navigate('Logs'); return; }
            void id;
            props.navigation.closeDrawer();
          }}
        />
      )}
    >
      <DrawerNav.Screen name="ChatInner" component={ChatInner} />
    </DrawerNav.Navigator>
  );
};
