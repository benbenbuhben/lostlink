import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, Button, Appbar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Linking } from 'react-native';

export default function SupportScreen() {
  const router = useRouter();

  const handleEmailSupport = () => {
    Linking.openURL('mailto:support@lostlink.app?subject=LostLink Support Request&body=Hello LostLink Support Team,%0A%0APlease describe your issue or question:%0A%0A');
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Support" />
      </Appbar.Header>

      <ScrollView style={styles.content}>
        <Card style={styles.card} elevation={2}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.title}>
              📧 Get Help & Support
            </Text>
            
            <Text variant="bodyMedium" style={styles.description}>
              Need help with LostLink? We're here to assist you with any questions or issues you might have.
            </Text>

            <View style={styles.section}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Common Issues:
              </Text>
              <Text style={styles.listItem}>• Can't find your lost item</Text>
              <Text style={styles.listItem}>• Problems submitting a claim</Text>
              <Text style={styles.listItem}>• Account login issues</Text>
              <Text style={styles.listItem}>• App crashes or bugs</Text>
              <Text style={styles.listItem}>• Questions about how LostLink works</Text>
            </View>

            <View style={styles.section}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Contact Information:
              </Text>
              <Text style={styles.contactInfo}>📧 Email: support@lostlink.app</Text>
              <Text style={styles.contactInfo}>⏰ Response Time: Usually within 24 hours</Text>
              <Text style={styles.contactInfo}>🏫 Campus: CityU CS624 Project</Text>
            </View>

            <Button
              mode="contained"
              onPress={handleEmailSupport}
              style={styles.emailButton}
              icon="email"
            >
              Send Support Email
            </Button>

            <Text variant="bodySmall" style={styles.note}>
              When contacting support, please include details about your issue and the device you're using.
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    borderRadius: 12,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  description: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
    lineHeight: 22,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 8,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  listItem: {
    color: '#666',
    marginBottom: 4,
    paddingLeft: 16,
  },
  contactInfo: {
    color: '#666',
    marginBottom: 4,
    paddingLeft: 8,
  },
  emailButton: {
    marginBottom: 16,
    borderRadius: 8,
  },
  note: {
    textAlign: 'center',
    color: '#888',
    fontStyle: 'italic',
  },
}); 