import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, Appbar } from 'react-native-paper';
import { useRouter } from 'expo-router';

export default function PrivacyScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Privacy Policy" />
      </Appbar.Header>

      <ScrollView style={styles.content}>
        <Card style={styles.card} elevation={2}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.title}>
              🔒 Privacy Policy
            </Text>
            
            <Text variant="bodySmall" style={styles.lastUpdated}>
              Last updated: December 2024
            </Text>

            <Text variant="bodyMedium" style={styles.intro}>
              LostLink is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our lost & found service.
            </Text>

            <View style={styles.section}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Information We Collect
              </Text>
              <Text style={styles.bodyText}>
                • <Text style={styles.bold}>Account Information:</Text> Name, email address (via Auth0)
              </Text>
              <Text style={styles.bodyText}>
                • <Text style={styles.bold}>Item Reports:</Text> Item descriptions, locations, photos
              </Text>
              <Text style={styles.bodyText}>
                • <Text style={styles.bold}>Claims:</Text> Email addresses and claim messages
              </Text>
              <Text style={styles.bodyText}>
                • <Text style={styles.bold}>Usage Data:</Text> App usage statistics and performance metrics
              </Text>
            </View>

            <View style={styles.section}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                How We Use Your Information
              </Text>
              <Text style={styles.bodyText}>
                • Connecting item owners with claimants
              </Text>
              <Text style={styles.bodyText}>
                • Sending email notifications about claims
              </Text>
              <Text style={styles.bodyText}>
                • Improving app performance and user experience
              </Text>
              <Text style={styles.bodyText}>
                • Preventing fraud and maintaining security
              </Text>
            </View>

            <View style={styles.section}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Data Sharing
              </Text>
              <Text style={styles.bodyText}>
                • We share your contact information only with verified item claimants
              </Text>
              <Text style={styles.bodyText}>
                • Item reports are visible to all app users for recovery purposes
              </Text>
              <Text style={styles.bodyText}>
                • We use SendGrid for email delivery services
              </Text>
              <Text style={styles.bodyText}>
                • We do NOT sell your data to third parties
              </Text>
            </View>

            <View style={styles.section}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Data Security
              </Text>
              <Text style={styles.bodyText}>
                • Authentication handled by Auth0 (industry standard)
              </Text>
              <Text style={styles.bodyText}>
                • Data encrypted in transit and at rest
              </Text>
              <Text style={styles.bodyText}>
                • Regular security updates and monitoring
              </Text>
              <Text style={styles.bodyText}>
                • Access controls and user permissions
              </Text>
            </View>

            <View style={styles.section}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Your Rights
              </Text>
              <Text style={styles.bodyText}>
                • Access your personal data
              </Text>
              <Text style={styles.bodyText}>
                • Request data deletion
              </Text>
              <Text style={styles.bodyText}>
                • Update your information
              </Text>
              <Text style={styles.bodyText}>
                • Opt out of email communications
              </Text>
            </View>

            <View style={styles.section}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Contact Us
              </Text>
              <Text style={styles.bodyText}>
                If you have questions about this Privacy Policy, please contact us at:
              </Text>
              <Text style={styles.contact}>
                📧 privacy@lostlink.app
              </Text>
              <Text style={styles.contact}>
                👨‍💻 Developed by Thomas Ha & Benjamin Hurst
              </Text>
            </View>

            <Text variant="bodySmall" style={styles.note}>
              This is a simplified privacy policy for a portfolio project. In a production environment, this would be more comprehensive and legally reviewed.
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
  bold: {
    fontWeight: 'bold',
    color: '#444',
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
  },
}); 