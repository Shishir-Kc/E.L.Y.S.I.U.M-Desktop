/**
 * Root navigator. Stack of: Chat (drawer) -> LiveConversation -> Logs.
 *
 * Chat is itself a Drawer.Navigator (see screens/ChatScreen.tsx) so this
 * top-level Stack nests one drawer per-screen-mode. The Live conversation
 * and Logs screens cover full screen on top of the chat surface.
 */
import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../config/theme';
import { ChatScreen } from '../screens/ChatScreen';
import { LiveConversationScreen } from '../screens/LiveConversationScreen';
import { LogsScreen } from '../screens/LogsScreen';

export type RootStackParamList = {
  Chat: undefined;
  LiveConversation: undefined;
  Logs: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const RNTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bgPrimary,
    card: colors.bgSurfaceVariant,
    text: colors.text_primary,
    border: colors.borderMed,
    primary: colors.accentPrimary,
    notification: colors.redAccent,
  },
};

export const RootNavigation: React.FC = () => {
  return (
    <NavigationContainer theme={RNTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bgPrimary },
        }}
      >
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="LiveConversation" component={LiveConversationScreen} />
        <Stack.Screen name="Logs" component={LogsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
