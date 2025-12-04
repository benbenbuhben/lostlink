// app/landing.tsx
import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';

export default function LandingScreen() {
  const { login } = useAuthStore();
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* logo / word-mark */}
      <View style={styles.logoRow}>
        <Image
          source={require('../assets/images/icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text variant="headlineSmall" style={styles.brand}>
          LostLink
        </Text>
      </View>

      {/* hero copy */}
      <Text variant="displayMedium" style={styles.title}>
        Find. Report. Reunite.
      </Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        A campus lost-and-found that reconnects people with their belongings.
      </Text>

      {/* primary CTAs */}
      <View style={styles.ctaRow}>
        <Button
          mode="contained"
          style={styles.primaryBtn}
          icon="arrow-right"
          onPress={() => login()}   // Auth0 popup
          accessibilityLabel="Sign in or create account"
        >
          Get Started
        </Button>
        <Button
          mode="text"
          onPress={() => login()}
          accessibilityLabel="Sign in"
        >
          Sign In
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 32,
    justifyContent: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: { width: 36, height: 36, marginRight: 8 },
  brand: { fontWeight: '700', color: '#0a7ea4' },
  title: {
    fontWeight: '800',
    lineHeight: 44,
    marginBottom: 16,
    color: '#11181C',
  },
  subtitle: {
    color: '#687076',
    lineHeight: 22,
    marginBottom: 40,
    maxWidth: 320,
  },
  ctaRow: { gap: 12 },
  primaryBtn: { borderRadius: 8 },
});
