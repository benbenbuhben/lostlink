import * as React from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Dimensions, AppState } from 'react-native';
import { Appbar, Card, Text, Chip } from 'react-native-paper';
import { useAuth } from '@/context/AuthContext';
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

function FeedScreen() {
  const { user, login, logout, ready } = useAuth();
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
      setError(null);
      console.log('Fetching items from API...');

      // Cache optimization with increased limit
      const response = await get<ApiResponse>('/items?limit=20');
      console.log('API response:', response);

      const endTime = Date.now();
      const totalTime = endTime - startTime;
      setLoadTime(totalTime);

      // Performance logging
      console.log(`Feed loaded in ${totalTime}ms (Backend: ${response.pagination.queryTime || 'N/A'}ms)`);

      // Remove duplicates based on _id
      const uniqueItems = response.data?.filter((item, index, self) =>
        index === self.findIndex(t => t._id === item._id)
      ) || [];

      setItems(uniqueItems);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch items:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load items';
      setError(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [get]);

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

  // Initial load
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Refresh when tab becomes focused
  useFocusEffect(
    useCallback(() => {
      console.log('🔄 Feed tab focused - refreshing...');
      fetchItems(true); // Silent refresh
    }, [fetchItems])
  );

  // Refresh when app comes to foreground
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        console.log('🔄 App became active - refreshing feed...');
        fetchItems(true); // Silent refresh
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
    };
  }, [fetchItems]);

  // Optimized render item with memoization
  const renderItem = useCallback(({ item }: { item: Item }) => {
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
            {/* auto-tags */}
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

  // Performance info component
  const PerformanceInfo = useMemo(() => {
    if (!loadTime) return null;

    return (
      <View style={styles.performanceContainer}>
        <Text variant="bodySmall" style={styles.performanceText}>
          Loaded {items.length} items in {loadTime}ms
        </Text>
      </View>
    );
  }, [loadTime, items.length]);

  if (!ready) {
    return <LoadingView message="Initializing..." />;
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.Content title="LostLink" />
        </Appbar.Header>
        <RequireAuth>
          <View />
        </RequireAuth>
      </View>
    );
  }

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.Content title="LostLink" />
          <Appbar.Action icon="logout" onPress={logout} accessibilityLabel="Logout" />
        </Appbar.Header>
        <LoadingView message="Loading latest items..." />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.Content title="LostLink" />
          <Appbar.Action icon="logout" onPress={logout} accessibilityLabel="Logout" />
        </Appbar.Header>
        <ErrorView
          title="Failed to load items"
          message={error}
          onRetry={handleRetry}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="LostLink" />
        <Appbar.Action icon="logout" onPress={logout} accessibilityLabel="Logout" />
      </Appbar.Header>

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
            contentContainerStyle={styles.listContainer}
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
              length: 200, // Approximate item height
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
  performanceContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  performanceText: {
    color: '#666',
    fontSize: 12,
  },
  itemCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  itemImage: {
    height: 120,
  },
  cardContent: {
    padding: 16,
  },
  itemTitle: {
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#1a1a1a',
  },
  itemLocation: {
    color: '#666',
    marginBottom: 4,
  },
  itemDescription: {
    color: '#888',
    marginBottom: 6,
    lineHeight: 18,
  },
  itemDate: {
    color: '#999',
    fontSize: 12,
  },
  listContainer: {
    paddingVertical: 8,
  },
});

export default FeedScreen;