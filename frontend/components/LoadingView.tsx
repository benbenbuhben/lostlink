import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';

interface LoadingViewProps {
  message?: string;
  size?: 'small' | 'large';
}

export function LoadingView({ message = 'Loading...', size = 'large' }: LoadingViewProps) {
  return (
    <View style={styles.container} accessibilityLabel="Loading content">
      <ActivityIndicator 
        size={size} 
        accessibilityLabel="Loading indicator"
        testID="loading-indicator"
      />
      <Text variant="bodyMedium" style={styles.text}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  text: {
    marginTop: 16,
    color: '#666',
    textAlign: 'center',
  },
}); 