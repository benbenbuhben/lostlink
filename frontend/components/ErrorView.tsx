import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';

interface ErrorViewProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  showRetry?: boolean;
}

export function ErrorView({ 
  title = 'Something went wrong',
  message = 'Please try again later.',
  onRetry,
  retryLabel = 'Try Again',
  showRetry = true
}: ErrorViewProps) {
  return (
    <View style={styles.container} accessibilityLabel="Error message">
      <Card style={styles.card} elevation={2}>
        <Card.Content style={styles.content}>
          <Text variant="headlineSmall" style={styles.title}>
            ⚠️ {title}
          </Text>
          
          <Text variant="bodyMedium" style={styles.message}>
            {message}
          </Text>
          
          {showRetry && onRetry && (
            <Button 
              mode="contained" 
              onPress={onRetry}
              style={styles.button}
              accessibilityLabel={`${retryLabel} button`}
              testID="error-retry-button"
            >
              {retryLabel}
            </Button>
          )}
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f5f5f5',
  },
  card: {
    maxWidth: 400,
    width: '100%',
  },
  content: {
    alignItems: 'center',
    padding: 24,
  },
  title: {
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: 'bold',
  },
  message: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
    lineHeight: 22,
  },
  button: {
    minWidth: 120,
  },
}); 