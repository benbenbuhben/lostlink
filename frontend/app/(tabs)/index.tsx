import * as React from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Dimensions, AppState, Platform, Image, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { Appbar, Card, Text, Chip } from 'react-native-paper';
import { useAuthStore } from '@/store/authStore';
import { useApi } from '../../hooks/useApi';
import { useRouter, useFocusEffect } from 'expo-router';
import { LoadingView } from '@/components/LoadingView';
import { ErrorView } from '@/components/ErrorView';
import { EmptyStateView } from '@/components/EmptyStateView';
import RequireAuth from '@/components/RequireAuth';

interface Item {
  _id: string;
  title: string;
  location: string;
  description?: string;
  imageUrl?: string;
  createdAt: string;
  tags?: string[];
}

interface ApiResponse {
  data: Item[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    queryTime?: number;
  };
}

const { width: screenWidth } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

function FeedScreen() {
  const { user, logout, ready } = useAuthStore();
  const { get } = useApi();
  const router = useRouter();

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadTime, setLoadTime] = useState<number | null>(null);

  const fetchItems = useCallback(async (silent = false) => {
    try {
      const startTime = Date.now();
      if (!silent) {
        setLoading(true);
      }
      if (!silent) {
        setError(null);
      }
      console.log('Fetching items from API...');

      const response = await get<ApiResponse>('/items?limit=20');
      console.log('API response:', response);

      const endTime = Date.now();
      const totalTime = endTime - startTime;
      setLoadTime(totalTime);

      console.log(`Feed loaded in ${totalTime}ms (Backend: ${response.pagination.queryTime || 'N/A'}ms)`);

      const uniqueItems = response.data?.filter((item, index, self) =>
        index === self.findIndex(t => t._id === item._id)
      ) || [];

      if (response && response.data !== undefined) {
        setItems(uniqueItems);
        setError(null);
      } else if (!silent) {
        setError('Invalid response from server');
      }
    } catch (err) {
      console.error('Failed to fetch items:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load items';
      
      if (!silent) {
        setError(errorMessage);
        if (items.length === 0) {
          setItems([]);
        }
      } else {
        console.warn('⚠️ Silent refresh failed:', errorMessage);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [get, items.length]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchItems();
  }, [fetchItems]);

  const handleItemPress = useCallback((itemId: string) => {
    router.push(`/item/${itemId}`);
  }, [router]);

  const handleRetry = useCallback(() => {
    fetchItems();
  }, [fetchItems]);

  const navigateToReport = useCallback(() => {
    router.push('/report');
  }, [router]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useFocusEffect(
    useCallback(() => {
      console.log('🔄 Feed tab focused - refreshing...');
      fetchItems(true);
    }, [fetchItems])
  );

  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        console.log('🔄 App became active - refreshing feed...');
        fetchItems(true);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
    };
  }, [fetchItems]);

  const renderItemWeb = useCallback(({ item }: { item: Item }) => {
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

      if (diffInHours < 1) return 'Just now';
      if (diffInHours < 24) return `${diffInHours}h ago`;
      return date.toLocaleDateString();
    };

    return (
      <TouchableOpacity
        onPress={() => handleItemPress(item._id)}
        style={{ marginBottom: 24 }}
        accessibilityLabel={`View details for ${item.title}`}
        accessibilityRole="button"
      >
        <Card style={styles.webItemCard} elevation={3}>
          {item.imageUrl && (
            <Card.Cover
              source={{ uri: item.imageUrl }}
              style={styles.webItemImage}
              accessibilityLabel={`Image of ${item.title}`}
            />
          )}
          <Card.Content style={styles.webCardContent}>
            <Text variant="titleLarge" style={styles.webItemTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
              <Text variant="bodyMedium" style={styles.webItemLocation}>
                📍 {item.location}
              </Text>
            </View>
            {item.description && (
              <Text variant="bodyMedium" style={styles.webItemDescription} numberOfLines={2}>
                {item.description}
              </Text>
            )}
            {item.tags && item.tags.length > 0 && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                {item.tags.map((tag) => (
                  <Chip key={tag} mode="outlined" style={{ marginRight: 4, marginBottom: 4 }}>
                    {tag}
                  </Chip>
                ))}
              </View>
            )}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#10b981', marginRight: 6 }} />
                <Text variant="bodySmall" style={{ color: '#6b7280' }}>Active</Text>
              </View>
              <Text variant="bodySmall" style={{ color: '#9ca3af' }}>{formatDate(item.createdAt)}</Text>
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  }, [handleItemPress]);

  const renderItemMobile = useCallback(({ item }: { item: Item }) => {
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

      if (diffInHours < 1) return 'Just now';
      if (diffInHours < 24) return `${diffInHours}h ago`;
      return date.toLocaleDateString();
    };

    return (
      <TouchableOpacity
        onPress={() => handleItemPress(item._id)}
        accessibilityLabel={`View details for ${item.title}`}
        accessibilityRole="button"
        testID={`item-${item._id}`}
      >
        <Card style={styles.itemCard} elevation={3}>
          {item.imageUrl && (
            <Card.Cover
              source={{ uri: item.imageUrl }}
              style={styles.itemImage}
              accessibilityLabel={`Image of ${item.title}`}
            />
          )}
          <Card.Content style={styles.cardContent}>
            <Text variant="titleMedium" style={styles.itemTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Text variant="bodySmall" style={styles.itemLocation}>
              📍 {item.location}
            </Text>
            {item.description && (
              <Text variant="bodySmall" style={styles.itemDescription} numberOfLines={2}>
                {item.description}
              </Text>
            )}
            {(item.tags?.length ?? 0) > 0 && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 }}>
                {(item.tags ?? []).map((tag) => (
                  <Chip key={tag} mode="outlined" style={{ marginRight: 4, marginBottom: 4 }}>
                    {tag}
                  </Chip>
                ))}
              </View>
            )}
            <Text variant="bodySmall" style={styles.itemDate}>
              {formatDate(item.createdAt)}
            </Text>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  }, [handleItemPress]);

  const renderItem = isWeb ? renderItemWeb : renderItemMobile;

  const PerformanceInfo = useMemo(() => {
    if (!loadTime) return null;

    if (isWeb) {
      return (
        <View style={styles.webPerformanceContainer}>
          <Text variant="bodySmall" style={styles.webPerformanceText}>
            Loaded <Text style={{ fontWeight: 'bold', color: '#3b82f6' }}>{items.length}</Text> items in <Text style={{ fontWeight: 'bold', color: '#3b82f6' }}>{loadTime}ms</Text>
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.performanceContainer}>
        <Text variant="bodySmall" style={styles.performanceText}>
          Loaded {items.length} items in {loadTime}ms
        </Text>
      </View>
    );
  }, [loadTime, items.length, isWeb]);

  if (!ready) {
    return <LoadingView message="Initializing..." />;
  }

  if (!user) {
    return (
      <View style={styles.container}>
        {!isWeb && (
          <Appbar.Header>
            <Appbar.Content title="LostLink" />
          </Appbar.Header>
        )}
        <RequireAuth>
          <View />
        </RequireAuth>
      </View>
    );
  }

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        {!isWeb && (
          <Appbar.Header>
            <Appbar.Content title="LostLink" />
            <Appbar.Action icon="logout" onPress={logout} accessibilityLabel="Logout" />
          </Appbar.Header>
        )}
        <LoadingView message="Loading latest items..." />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        {!isWeb && (
          <Appbar.Header>
            <Appbar.Content title="LostLink" />
            <Appbar.Action icon="logout" onPress={logout} accessibilityLabel="Logout" />
          </Appbar.Header>
        )}
        <ErrorView
          title="Failed to load items"
          message={error}
          onRetry={handleRetry}
        />
      </View>
    );
  }

  const WebHeader = isWeb ? (
    <Appbar.Header style={{ backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }}>
      <Appbar.Content title="LostLink" />
      <Appbar.Action icon="logout" onPress={logout} accessibilityLabel="Logout" />
    </Appbar.Header>
  ) : null;

  return (
    <View style={[styles.container, isWeb && styles.webContainer]}>
      {WebHeader}
      {!isWeb && (
        <Appbar.Header>
          <Appbar.Content title="LostLink" />
          <Appbar.Action icon="logout" onPress={logout} accessibilityLabel="Logout" />
        </Appbar.Header>
      )}

      {items.length === 0 ? (
        <EmptyStateView
          emoji="📦"
          title="No items found yet"
          description="Be the first to report a found item and help someone recover their lost belongings!"
          actionLabel="Report Found Item"
          onAction={navigateToReport}
        />
      ) : (
        <>
          {PerformanceInfo}
          <FlatList
            data={items}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            contentContainerStyle={isWeb ? { 
              padding: 32, 
              maxWidth: 1200, 
              alignSelf: 'center', 
              width: '100%',
              paddingBottom: 80
            } : styles.listContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                accessibilityLabel="Pull to refresh"
              />
            }
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={10}
            getItemLayout={(data, index) => ({
              length: 200,
              offset: 200 * index,
              index,
            })}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f6f6",
  },
  webContainer: {
    backgroundColor: '#f9fafb',
  },
  performanceContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  webPerformanceContainer: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#dbeafe',
  },
  performanceText: {
    color: '#666',
    fontSize: 12,
  },
  webPerformanceText: {
    color: '#1e40af',
    fontSize: 12,
  },
  itemCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  webItemCard: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  itemImage: {
    height: 120,
  },
  webItemImage: {
    height: 240,
  },
  cardContent: {
    padding: 16,
  },
  webCardContent: {
    padding: 20,
  },
  itemTitle: {
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#1a1a1a',
  },
  webItemTitle: {
    fontWeight: 'bold',
    fontSize: 20,
    color: '#111827',
    marginBottom: 8,
  },
  itemLocation: {
    color: '#666',
    marginBottom: 4,
  },
  webItemLocation: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
  },
  itemDescription: {
    color: '#888',
    marginBottom: 6,
    lineHeight: 18,
  },
  webItemDescription: {
    color: '#6b7280',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  itemDate: {
    color: '#999',
    fontSize: 12,
  },
  listContainer: {
    paddingVertical: 8,
  },
} as const);

export default FeedScreen;
