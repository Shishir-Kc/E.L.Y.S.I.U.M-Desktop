/**
 * React Native app entry. Mirrors `lib/main.dart` (the `runApp(MyApp())` call).
 *
 * Wraps the RootNavigation in aGestureHandlerRootView so drawers and bottom
 * sheets function. Also loads expo-google-fonts equivalents (we fall back to
 * system fonts if Outfit/Inter/JetBrainsMono aren't bundled).
 */
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import { RootNavigation } from './src/navigation/RootNavigation';
import { colors } from './src/config/theme';

const App: React.FC = () => {
  return (
    <GestureHandlerRootView style={local.root}>
      <SafeAreaProvider>
        <RootNavigation />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

const local = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgPrimary },
});

export default App;
