import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, Redirect, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { PaperProvider } from 'react-native-paper';
import { Platform } from 'react-native';

import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuthStore } from '@/store/authStore';

SplashScreen.preventAutoHideAsync();
const queryClient = new QueryClient();

/* ----------------------- auth-aware router ----------------------- */
function AuthAwareStack() {
  const { user, ready } = useAuthStore();
  const router = useRouter();
  const { usePathname } = require('expo-router');
  const pathname = usePathname();

  /* wait until auth store finishes bootstrapping */
  if (!ready) return null;

  // Redirect authenticated users away from /landing
  if (user && pathname.startsWith('/landing')) {
    return <Redirect href="/" />;
  }

  /* if the user isn’t logged in and they somehow hit “/”, shove them to /landing */
  if (!user && pathname === '/') return <Redirect href="/landing" />;

  return (
    <Stack>
      {user ? (
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      ) : (
        <Stack.Screen name="landing" options={{ headerShown: false }} />
      )}

      {/* secondary pages */}
      <Stack.Screen name="item/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="support" options={{ headerShown: false }} />
      <Stack.Screen name="privacy" options={{ headerShown: false }} />
      <Stack.Screen name="terms" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

/* --------------------------- root layout ------------------------ */
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  /* hide native splash once fonts are in */
  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  /* initialize auth store */
  useEffect(() => {
    useAuthStore.getState().initialize();
  }, []);

  if (!fontsLoaded) return null;

  return (
    <PaperProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <AuthAwareStack />
          <StatusBar style="auto" />
        </ThemeProvider>

        {/* devtools are handy – remove in prod */}
      </QueryClientProvider>
    </PaperProvider>
  );
}
