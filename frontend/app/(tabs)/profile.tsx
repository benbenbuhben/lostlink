import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import RequireAuth from '@/components/RequireAuth';
import { useAuth } from '@/context/AuthContext';

function ProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <RequireAuth>
      <View style={styles.container}>
        <Text variant="headlineMedium">Profile</Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          {user?.email ?? user?.name}
        </Text>
        <Text variant="bodyMedium" style={{ marginTop: 16 }} onPress={logout}>
          Tap here to logout
        </Text>
      </View>
    </RequireAuth>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  subtitle: {
    textAlign: 'center',
    marginTop: 8,
    color: '#666',
  },
});

export default ProfileScreen; 