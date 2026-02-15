/**
 * Auth Layout
 * Wraps authentication screens
 */

import React from 'react';
import { Stack } from 'expo-router';
import { Colors } from '@/constants/colors';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.cream[50] },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen
        name="onboarding"
        options={{
          gestureEnabled: false,
        }}
      />
    </Stack>
  );
}

