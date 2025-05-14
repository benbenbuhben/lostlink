import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import RequireAuth from '@/components/RequireAuth';

function ReportScreen() {
  return (
    <RequireAuth>
      <View style={styles.container}>
        <Text variant="headlineMedium">Report Found Item</Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          This screen will let you submit a new lost &amp; found item.
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

export default ReportScreen; 