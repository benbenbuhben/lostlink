import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import RequireAuth from '@/components/RequireAuth';

function SearchScreen() {
  return (
    <RequireAuth>
      <View style={styles.container}>
        <Text variant="headlineMedium">Search</Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Here you will be able to search and filter found items.
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

export default SearchScreen; 