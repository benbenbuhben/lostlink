import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useAuth } from '@/context/AuthContext';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, login, ready } = useAuth();

  if (!ready) return null;

  if (!user) {
    return (
      <View style={styles.container}>
        <Text variant="bodyLarge" style={{ marginBottom: 12 }}>Please log in to continue</Text>
        <Button mode="contained" onPress={login} icon="login">Login with Auth0</Button>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
});

export default RequireAuth; 