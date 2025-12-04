import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter, router } from 'expo-router';
import { 
  Appbar, 
  Card, 
  Text, 
  Button, 
  TextInput, 
  Chip,
  Divider,
  Portal,
  Snackbar
} from 'react-native-paper';
import { useApi } from '../../hooks/useApi';
import { useAuthStore } from '@/store/authStore';
import { LoadingView } from '@/components/LoadingView';
import { ErrorView } from '@/components/ErrorView';

interface Item {
  _id: string;
  title: string;
  location: string;
  description?: string;
  imageUrl?: string;
  createdAt: string;
  claims?: Claim[];
}

interface Claim {
  _id: string;
  claimerId: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

interface ClaimResponse {
  message: string;
  claim: Claim;
  performance?: {
    dbOperationTime: number;
    totalResponseTime: number;
    emailQueued: boolean;
  };
}

const { width: screenWidth } = Dimensions.get('window');

function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const routerHook = useRouter();
  const { get, post } = useApi();
  const { user } = useAuthStore();
  
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [claimMessage, setClaimMessage] = useState('');
  const [claimerEmail, setClaimerEmail] = useState('');
  const [submittingClaim, setSubmittingClaim] = useState(false);
  const [snackMessage, setSnackMessage] = useState('');
  const [showSnack, setShowSnack] = useState(false);

  // Safe navigation function
  const safeGoBack = () => {
    if (routerHook.canGoBack()) {
      routerHook.back();
    } else {
      router.replace('/');
    }
  };

  const fetchItem = async (silent = false) => {
    if (!id) return;
    
    try {
      if (!silent) {
        setLoading(true);
      }
      setError(null);
      const response = await get<Item>(`/items/${id}`);
      setItem(response);
    } catch (error) {
      console.error('Failed to fetch item:', error);
      if (!silent) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load item';
        setError(errorMessage);
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const handleClaim = async () => {
    if (!id || !user) return;
    
    // Validation
    if (!claimMessage.trim()) {
      setSnackMessage('Please enter a claim message.');
      setShowSnack(true);
      return;
    }

    if (claimMessage.trim().length < 10) {
      setSnackMessage('Please provide a more detailed claim message (at least 10 characters).');
      setShowSnack(true);
      return;
    }

    if (!claimerEmail.trim()) {
      setSnackMessage('Please enter your email address.');
      setShowSnack(true);
      return;
    }

    // Simple email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(claimerEmail.trim())) {
      setSnackMessage('Please enter a valid email address.');
      setShowSnack(true);
      return;
    }

    try {
      setSubmittingClaim(true);
      const startTime = Date.now();
      
      const response = await post<ClaimResponse>(`/items/${id}/claim`, { 
        message: claimMessage,
        email: claimerEmail.trim()
      });
      
      const responseTime = Date.now() - startTime;
      console.log(`🚀 Claim submission took ${responseTime}ms`);
      
      // Success notification
      const performance = response.performance;
      setSnackMessage(
        `✅ Claim submitted successfully! ${performance?.emailQueued ? 'Owner notified via email.' : ''}`
      );
      setShowSnack(true);
      
      // Clear form
      setClaimMessage('');
      setClaimerEmail('');
      
      // Auto-refresh to show new claim
      setTimeout(() => {
        fetchItem();
      }, 500);
      
    } catch (error) {
      console.error('Failed to submit claim:', error);
      
      // Enhanced error handling with specific messages
      let errorMessage = 'Failed to submit claim. Please try again.';
      
      if (error instanceof Error && error.message?.includes('409')) {
        errorMessage = 'You have already submitted a claim for this item.';
      } else if (error instanceof Error && error.message?.includes('400')) {
        errorMessage = 'Please provide a more detailed claim message.';
      } else if (error instanceof Error && error.message?.includes('404')) {
        errorMessage = 'This item is no longer available.';
      }
      
      setSnackMessage(errorMessage);
      setShowSnack(true);
    } finally {
      setSubmittingClaim(false);
    }
  };

  const handleRetry = () => {
    fetchItem();
  };

  useEffect(() => {
    fetchItem();
  }, [id]);

  // Auto-refresh every 15 seconds for real-time updates (silent refresh)
  useEffect(() => {
    if (!id) return;
    
    const interval = setInterval(() => {
      fetchItem(true); // Silent refresh - no loading indicator
    }, 15000); // 15초마다 자동 업데이트
    
    return () => clearInterval(interval);
  }, [id]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={safeGoBack} accessibilityLabel="Go back" />
          <Appbar.Content title="Loading..." />
        </Appbar.Header>
        <LoadingView message="Loading item details..." />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={safeGoBack} accessibilityLabel="Go back" />
          <Appbar.Content title="Error" />
        </Appbar.Header>
        <ErrorView
          title="Failed to load item"
          message={error}
          onRetry={handleRetry}
        />
      </View>
    );
  }

  if (!item) {
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={safeGoBack} accessibilityLabel="Go back" />
          <Appbar.Content title="Item Not Found" />
        </Appbar.Header>
        <ErrorView
          title="Item not found"
          message="This item may have been removed or is no longer available."
          retryLabel="Go Back"
          onRetry={safeGoBack}
        />
      </View>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#4CAF50';
      case 'rejected': return '#F44336';
      default: return '#FF9800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      default: return 'Pending';
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={safeGoBack} accessibilityLabel="Go back" />
        <Appbar.Content title={item.title} titleStyle={{ fontSize: 16 }} />
      </Appbar.Header>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Item Details Card */}
        <Card style={styles.itemCard} elevation={3}>
          {item.imageUrl && (
            <Card.Cover 
              source={{ uri: item.imageUrl }} 
              style={styles.image}
              accessibilityLabel={`Image of ${item.title}`}
            />
          )}
          <Card.Content style={styles.cardContent}>
            <Text variant="headlineSmall" style={styles.title} accessibilityRole="header">
              {item.title}
            </Text>
            
            <View style={styles.infoRow}>
              <Text variant="bodySmall" style={styles.label}>Location:</Text>
              <Text variant="bodyMedium">📍 {item.location}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text variant="bodySmall" style={styles.label}>Found:</Text>
              <Text variant="bodyMedium">{formatDate(item.createdAt)}</Text>
            </View>

            {item.description && (
              <View style={styles.descriptionSection}>
                <Text variant="bodySmall" style={styles.label}>Description:</Text>
                <Text variant="bodyMedium" style={styles.description}>
                  {item.description}
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Claim Form */}
        <Card style={styles.claimCard} elevation={2}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Is this your item?
            </Text>
            
            <TextInput
              label="Your Email Address*"
              value={claimerEmail}
              onChangeText={setClaimerEmail}
              style={styles.emailInput}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="your.email@example.com"
              accessibilityLabel="Enter your email address"
              testID="claimer-email-input"
            />
            
            <TextInput
              label="Claim Message (Please explain why this item belongs to you)*"
              multiline
              numberOfLines={4}
              value={claimMessage}
              onChangeText={setClaimMessage}
              style={styles.claimInput}
              placeholder="Example: This is my wallet that I lost yesterday at the library. It contains my student ID and credit cards."
              accessibilityLabel="Enter your claim message"
              testID="claim-message-input"
            />
            
            <Button
              mode="contained"
              onPress={handleClaim}
              loading={submittingClaim}
              disabled={submittingClaim || !user}
              style={styles.claimButton}
              icon="hand-heart"
              accessibilityLabel="Submit claim for this item"
              testID="submit-claim-button"
            >
              Submit Claim
            </Button>
            
            {!user && (
              <Text variant="bodySmall" style={styles.loginNote}>
                You need to login to submit a claim.
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* Existing Claims List */}
        {item.claims && item.claims.length > 0 && (
          <Card style={styles.claimsListCard} elevation={2}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Submitted Claims ({item.claims.length})
              </Text>
              
              <Divider style={styles.divider} />
              
              {item.claims.map((claim, index) => (
                <View key={claim._id} style={styles.claimItem}>
                  <View style={styles.claimHeader}>
                    <Chip 
                      mode="outlined" 
                      textStyle={{ color: getStatusColor(claim.status) }}
                      style={{ borderColor: getStatusColor(claim.status) }}
                      accessibilityLabel={`Claim status: ${getStatusText(claim.status)}`}
                    >
                      {getStatusText(claim.status)}
                    </Chip>
                    <Text variant="bodySmall" style={styles.claimDate}>
                      {formatDate(claim.createdAt)}
                    </Text>
                  </View>
                  
                  <Text variant="bodyMedium" style={styles.claimMessage}>
                    {claim.message}
                  </Text>
                  
                  {index < (item.claims?.length || 0) - 1 && (
                    <Divider style={styles.claimDivider} />
                  )}
                </View>
              ))}
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      {/* Snackbar for messages */}
      <Portal>
        <Snackbar
          visible={showSnack}
          onDismiss={() => setShowSnack(false)}
          duration={4000}
          action={{
            label: 'Dismiss',
            onPress: () => setShowSnack(false),
          }}
        >
          {snackMessage}
        </Snackbar>
      </Portal>
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
  itemCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    height: Math.min(screenWidth * 0.4, 200),
  },
  cardContent: {
    padding: 20,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1a1a1a',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    minWidth: 80,
    marginRight: 8,
    color: '#666',
    fontWeight: '500',
  },
  descriptionSection: {
    marginTop: 16,
  },
  description: {
    marginTop: 8,
    lineHeight: 22,
    color: '#444',
  },
  claimCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1a1a1a',
  },
  claimInput: {
    marginBottom: 16,
  },
  emailInput: {
    marginBottom: 16,
  },
  claimButton: {
    marginBottom: 8,
    borderRadius: 8,
  },
  loginNote: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
  claimsListCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  divider: {
    marginBottom: 16,
  },
  claimItem: {
    marginBottom: 16,
  },
  claimHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  claimDate: {
    color: '#666',
  },
  claimMessage: {
    lineHeight: 20,
    color: '#444',
  },
  claimDivider: {
    marginTop: 16,
  },
});

export default ItemDetailScreen; 