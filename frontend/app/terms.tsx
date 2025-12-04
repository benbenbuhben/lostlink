import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, Appbar } from 'react-native-paper';
import { useRouter } from 'expo-router';

export default function TermsScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Terms of Service" />
      </Appbar.Header>

      <ScrollView style={styles.content}>
        <Card style={styles.card} elevation={2}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.title}>
              📋 Terms of Service
            </Text>
            
            <Text variant="bodySmall" style={styles.lastUpdated}>
              Last updated: December 2024
            </Text>

            <Text variant="bodyMedium" style={styles.intro}>
              Welcome to LostLink! By using our lost & found service, you agree to these terms and conditions. Please read them carefully.
            </Text>

            <View style={styles.section}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                1. Service Description
              </Text>
              <Text style={styles.bodyText}>
                LostLink is a platform that helps connect people who have lost items with those who have found them. This is a personal portfolio project developed by Thomas Ha and Benjamin Hurst.
              </Text>
            </View>

            <View style={styles.section}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                2. User Responsibilities
              </Text>
              <Text style={styles.bodyText}>• Provide accurate information when reporting items</Text>
              <Text style={styles.bodyText}>• Be respectful in all communications</Text>
              <Text style={styles.bodyText}>• Only claim items that genuinely belong to you</Text>
              <Text style={styles.bodyText}>• Report any inappropriate behavior or content</Text>
              <Text style={styles.bodyText}>• Use the service for legitimate lost & found purposes only</Text>
            </View>

            <View style={styles.section}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                3. Prohibited Activities
              </Text>
              <Text style={styles.bodyText}>• Posting false or misleading information</Text>
              <Text style={styles.bodyText}>• Attempting to claim items that don't belong to you</Text>
              <Text style={styles.bodyText}>• Harassing or threatening other users</Text>
              <Text style={styles.bodyText}>• Using the service for commercial purposes</Text>
              <Text style={styles.bodyText}>• Sharing inappropriate content or images</Text>
            </View>

            <View style={styles.section}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                4. Content & Privacy
              </Text>
              <Text style={styles.bodyText}>
                • You retain ownership of content you post
              </Text>
              <Text style={styles.bodyText}>
                • You grant us permission to display your content for service purposes
              </Text>
              <Text style={styles.bodyText}>
                • We may remove content that violates these terms
              </Text>
              <Text style={styles.bodyText}>
                • Your privacy is protected according to our Privacy Policy
              </Text>
            </View>

            <View style={styles.section}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                5. Disclaimers
              </Text>
              <Text style={styles.bodyText}>
                • LostLink is provided "as is" as a portfolio project
              </Text>
              <Text style={styles.bodyText}>
                • We cannot guarantee successful item recovery
              </Text>
              <Text style={styles.bodyText}>
                • Users interact at their own risk
              </Text>
              <Text style={styles.bodyText}>
                • We are not responsible for disputes between users
              </Text>
            </View>

            <View style={styles.section}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                6. Safety Guidelines
              </Text>
              <Text style={styles.bodyText}>
                • Meet in public places when exchanging items
              </Text>
              <Text style={styles.bodyText}>
                • Bring a friend if possible
              </Text>
              <Text style={styles.bodyText}>
                • Verify identity before handing over items
              </Text>
              <Text style={styles.bodyText}>
                • Trust your instincts - report suspicious behavior
              </Text>
            </View>

            <View style={styles.section}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                7. Project Information
              </Text>
              <Text style={styles.bodyText}>
                LostLink is a personal portfolio project developed by Thomas Ha and Benjamin Hurst. This service demonstrates full-stack development capabilities including React Native, Node.js, and cloud infrastructure.
              </Text>
            </View>

            <View style={styles.section}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                8. Contact & Support
              </Text>
              <Text style={styles.bodyText}>
                For questions about these terms or to report issues:
              </Text>
              <Text style={styles.contact}>📧 legal@lostlink.app</Text>
              <Text style={styles.contact}>👨‍💻 Developed by Thomas Ha & Benjamin Hurst</Text>
            </View>

            <Text variant="bodySmall" style={styles.note}>
              By using LostLink, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
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
    marginBottom: 8,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  lastUpdated: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#888',
    fontStyle: 'italic',
  },
  intro: {
    marginBottom: 24,
    color: '#666',
    lineHeight: 22,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    marginBottom: 8,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  bodyText: {
    color: '#666',
    marginBottom: 6,
    lineHeight: 20,
  },
  contact: {
    color: '#666',
    marginBottom: 4,
    paddingLeft: 8,
  },
  note: {
    marginTop: 16,
    textAlign: 'center',
    color: '#888',
    fontStyle: 'italic',
    fontSize: 12,
    fontWeight: 'bold',
  },
}); 