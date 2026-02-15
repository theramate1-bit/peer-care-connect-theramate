/**
 * Root Layout
 * App-wide providers and configuration
 */

import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StripeProvider } from '@stripe/stripe-react-native';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { useAuthStore } from '@/stores/authStore';
import { API_CONFIG } from '@/constants/config';
import { Colors } from '@/constants/colors';

import '../global.css';

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});

export default function RootLayout() {
  const [isReady, setIsReady] = React.useState(false);
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    async function prepare() {
      try {
        // Load fonts
        await Font.loadAsync({
          'Outfit-Regular': require('../assets/fonts/Outfit-Regular.ttf'),
          'Outfit-Medium': require('../assets/fonts/Outfit-Medium.ttf'),
          'Outfit-SemiBold': require('../assets/fonts/Outfit-SemiBold.ttf'),
          'Outfit-Bold': require('../assets/fonts/Outfit-Bold.ttf'),
        });

        // Initialize auth
        await initialize();
      } catch (e) {
        console.warn('App preparation error:', e);
      } finally {
        setIsReady(true);
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, [initialize]);

  if (!isReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StripeProvider
            publishableKey={API_CONFIG.STRIPE_PUBLISHABLE_KEY}
            merchantIdentifier={API_CONFIG.STRIPE_MERCHANT_ID}
            urlScheme="theramate"
          >
            <StatusBar style="dark" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: Colors.cream[50] },
                animation: 'slide_from_right',
              }}
            >
              {/* Auth Group */}
              <Stack.Screen
                name="(auth)"
                options={{
                  headerShown: false,
                }}
              />

              {/* Main App Tabs */}
              <Stack.Screen
                name="(tabs)"
                options={{
                  headerShown: false,
                }}
              />

              {/* Modal Screens */}
              <Stack.Screen
                name="booking"
                options={{
                  presentation: 'modal',
                  animation: 'slide_from_bottom',
                }}
              />
            </Stack>
          </StripeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

