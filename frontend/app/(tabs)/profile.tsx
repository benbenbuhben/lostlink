import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, Button, Avatar, Divider, List, Appbar } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import RequireAuth from '@/components/RequireAuth';

function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleEmailSupport = () => {
    router.push('/support');
  };

  const handlePrivacyPolicy = () => {
    router.push('/privacy');
  };

  const handleTermsOfService = () => {
    router.push('/terms');
  };

  return (
    <RequireAuth>
      <View style={styles.outerContainer}>
        <Appbar.Header>
          <Appbar.Content title="Profile" />
          <Appbar.Action icon="logout" onPress={logout} accessibilityLabel="Logout" />
        </Appbar.Header>

        <ScrollView 
          style={styles.container} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* User Profile Card */}
          <Card style={styles.profileCard} elevation={3}>
            <Card.Content style={styles.profileContent}>
              <Avatar.Text 
                size={80} 
                label={user?.name?.charAt(0).toUpperCase() || 'U'}
                style={styles.avatar}
              />
              
              <Text variant="headlineSmall" style={styles.userName}>
                {user?.name || 'User'}
              </Text>
              
              <Text variant="bodyMedium" style={styles.userEmail}>
                {user?.email || 'No email provided'}
              </Text>
              
              <Text variant="bodySmall" style={styles.userInfo}>
                Member since {new Date().toLocaleDateString('en-US', { 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </Text>
            </Card.Content>
          </Card>

          {/* App Information Card */}
          <Card style={styles.infoCard} elevation={2}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                About LostLink
              </Text>
              
              <Text variant="bodyMedium" style={styles.description}>
                LostLink helps you report, browse, and claim lost & found items in your community. 
                Together, we're building a more connected and helpful campus environment.
              </Text>

              <Divider style={styles.divider} />

              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text variant="titleMedium" style={styles.statNumber}>
                    🔍
                  </Text>
                  <Text variant="bodySmall" style={styles.statLabel}>
                    Search Items
                  </Text>
                </View>
                
                <View style={styles.statItem}>
                  <Text variant="titleMedium" style={styles.statNumber}>
                    📝
                  </Text>
                  <Text variant="bodySmall" style={styles.statLabel}>
                    Report Found
                  </Text>
                </View>
                
                <View style={styles.statItem}>
                  <Text variant="titleMedium" style={styles.statNumber}>
                    🤝
                  </Text>
                  <Text variant="bodySmall" style={styles.statLabel}>
                    Help Others
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* Settings & Support Card */}
          <Card style={styles.settingsCard} elevation={2}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Settings & Support
              </Text>

              <List.Item
                title="Email Support"
                description="Get help with your account or report issues"
                left={(props) => <List.Icon {...props} icon="email" />}
                right={(props) => <List.Icon {...props} icon="chevron-right" />}
                onPress={handleEmailSupport}
                style={styles.listItem}
                accessibilityLabel="Contact email support"
              />

              <Divider />

              <List.Item
                title="Privacy Policy"
                description="Learn how we protect your data"
                left={(props) => <List.Icon {...props} icon="shield-account" />}
                right={(props) => <List.Icon {...props} icon="chevron-right" />}
                onPress={handlePrivacyPolicy}
                style={styles.listItem}
                accessibilityLabel="View privacy policy"
              />

              <Divider />

              <List.Item
                title="Terms of Service"
                description="Review our terms and conditions"
                left={(props) => <List.Icon {...props} icon="file-document" />}
                right={(props) => <List.Icon {...props} icon="chevron-right" />}
                onPress={handleTermsOfService}
                style={styles.listItem}
                accessibilityLabel="View terms of service"
              />
            </Card.Content>
          </Card>

          {/* App Version Card */}
          <Card style={styles.versionCard} elevation={1}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                App Information
              </Text>
              
              <View style={styles.versionInfo}>
                <Text variant="bodySmall" style={styles.versionLabel}>
                  Version: 1.0.0
                </Text>
                <Text variant="bodySmall" style={styles.versionLabel}>
                  Build: 2024.1
                </Text>
                <Text variant="bodySmall" style={styles.versionLabel}>
                  Platform: React Native + Expo
                </Text>
              </View>

              <Text variant="bodySmall" style={styles.credits}>
                Built with ❤️ for the community
              </Text>
            </Card.Content>
          </Card>
        </ScrollView>
      </View>
    </RequireAuth>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  scrollContent: {
    paddingBottom: 100,
    flexGrow: 1,
  },
  profileCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  profileContent: {
    alignItems: 'center',
    padding: 24,
  },
  avatar: {
    marginBottom: 16,
    backgroundColor: '#1976d2',
  },
  userName: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#1a1a1a',
    textAlign: 'center',
  },
  userEmail: {
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  userInfo: {
    color: '#888',
    textAlign: 'center',
  },
  infoCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1a1a1a',
  },
  description: {
    lineHeight: 22,
    color: '#666',
    marginBottom: 16,
  },
  divider: {
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 32,
    marginBottom: 4,
  },
  statLabel: {
    color: '#666',
    textAlign: 'center',
  },
  settingsCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  listItem: {
    paddingVertical: 8,
  },
  versionCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  versionInfo: {
    marginBottom: 12,
    gap: 4,
  },
  versionLabel: {
    color: '#666',
  },
  credits: {
    color: '#888',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default ProfileScreen; 