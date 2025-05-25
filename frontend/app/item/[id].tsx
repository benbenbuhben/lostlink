import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, router } from 'expo-router';
import { 
  Appbar, 
  Card, 
  Text, 
  Button, 
  TextInput, 
  ActivityIndicator,
  Chip,
  Divider
} from 'react-native-paper';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';

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

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const routerHook = useRouter();
  const { get, post } = useApi();
  const { user } = useAuth();
  
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [claimMessage, setClaimMessage] = useState('');
  const [submittingClaim, setSubmittingClaim] = useState(false);

  // 안전한 뒤로가기 함수
  const safeGoBack = () => {
    if (routerHook.canGoBack()) {
      routerHook.back();
    } else {
      router.replace('/'); // 메인 피드로 이동
    }
  };

  const fetchItem = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await get<Item>(`/items/${id}`);
      setItem(response);
    } catch (error) {
      console.error('Failed to fetch item:', error);
      Alert.alert('Error', 'Failed to load item information.');
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async () => {
    if (!id || !user) return;
    
    if (!claimMessage.trim()) {
      Alert.alert('Notice', 'Please enter a claim message.');
      return;
    }

    try {
      setSubmittingClaim(true);
      await post(`/items/${id}/claim`, { message: claimMessage });
      
      Alert.alert(
        'Claim Submitted',
        'Your claim has been successfully submitted. The item owner will review and contact you soon.',
        [
          { 
            text: 'Stay Here', 
            onPress: () => {
              setClaimMessage('');
              fetchItem(); // Refresh to update claims list
            }
          },
          { 
            text: 'Go Back', 
            onPress: () => {
              safeGoBack();
            },
            style: 'default'
          }
        ]
      );
    } catch (error) {
      console.error('Failed to submit claim:', error);
      Alert.alert('Error', 'Failed to submit claim.');
    } finally {
      setSubmittingClaim(false);
    }
  };

  useEffect(() => {
    fetchItem();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!item) {
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={safeGoBack} />
          <Appbar.Content title="Item Not Found" />
        </Appbar.Header>
        <View style={styles.errorContainer}>
          <Text>Item not found.</Text>
        </View>
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
        <Appbar.BackAction onPress={safeGoBack} />
        <Appbar.Content title="Item Details" />
      </Appbar.Header>
      
      <ScrollView style={styles.content}>
        <Card style={styles.itemCard}>
          {item.imageUrl && (
            <Card.Cover source={{ uri: item.imageUrl }} style={styles.image} />
          )}
          
          <Card.Content style={styles.cardContent}>
            <Text variant="headlineMedium" style={styles.title}>
              {item.title}
            </Text>
            
            <View style={styles.infoRow}>
              <Text variant="labelLarge" style={styles.label}>📍 Location:</Text>
              <Text variant="bodyLarge">{item.location}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text variant="labelLarge" style={styles.label}>📅 Found Date:</Text>
              <Text variant="bodyLarge">{formatDate(item.createdAt)}</Text>
            </View>
            
            {item.description && (
              <View style={styles.descriptionSection}>
                <Text variant="labelLarge" style={styles.label}>📝 Description:</Text>
                <Text variant="bodyMedium" style={styles.description}>
                  {item.description}
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* 클레임 섹션 */}
        <Card style={styles.claimCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Is this your item?
            </Text>
            
            <TextInput
              label="Claim Message (Please explain why this item belongs to you)"
              multiline
              numberOfLines={4}
              value={claimMessage}
              onChangeText={setClaimMessage}
              style={styles.claimInput}
              placeholder="Example: This is my wallet that I lost yesterday at the library. It contains my student ID and credit cards."
            />
            
            <Button
              mode="contained"
              onPress={handleClaim}
              loading={submittingClaim}
              disabled={submittingClaim || !user}
              style={styles.claimButton}
              icon="hand-heart"
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

        {/* 기존 클레임 목록 */}
        {item.claims && item.claims.length > 0 && (
          <Card style={styles.claimsListCard}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  itemCard: {
    marginBottom: 16,
  },
  image: {
    height: 200,
  },
  cardContent: {
    padding: 16,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 16,
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
  },
  descriptionSection: {
    marginTop: 16,
  },
  description: {
    marginTop: 8,
    lineHeight: 20,
  },
  claimCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  claimInput: {
    marginBottom: 16,
  },
  claimButton: {
    marginBottom: 8,
  },
  loginNote: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
  claimsListCard: {
    marginBottom: 16,
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
  },
  claimDivider: {
    marginTop: 16,
  },
}); 