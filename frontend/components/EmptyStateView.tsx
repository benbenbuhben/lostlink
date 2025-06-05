import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';

interface EmptyStateViewProps {
  emoji?: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyStateView({ 
  emoji = '📭',
  title,
  description,
  actionLabel,
  onAction
}: EmptyStateViewProps) {
  return (
    <View style={styles.container} accessibilityLabel="Empty state">
      <Card style={styles.card} elevation={1}>
        <Card.Content style={styles.content}>
          <Text style={styles.emoji} accessibilityLabel="Empty state icon">
            {emoji}
          </Text>
          
          <Text variant="headlineSmall" style={styles.title}>
            {title}
          </Text>
          
          <Text variant="bodyMedium" style={styles.description}>
            {description}
          </Text>
          
          {actionLabel && onAction && (
            <Button 
              mode="contained" 
              onPress={onAction}
              style={styles.button}
              accessibilityLabel={`${actionLabel} button`}
              testID="empty-state-action-button"
            >
              {actionLabel}
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
  },
  card: {
    maxWidth: 400,
    width: '100%',
  },
  content: {
    alignItems: 'center',
    padding: 32,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: 'bold',
  },
  description: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
    lineHeight: 22,
  },
  button: {
    minWidth: 120,
  },
}); 