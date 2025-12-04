import * as React from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Dimensions, AppState, Platform, Image } from 'react-native';
import { Appbar, Card, Text, Chip } from 'react-native-paper';
import { useAuthStore } from '@/store/authStore';
import { useApi } from '../../hooks/useApi';
import { useRouter, useFocusEffect } from 'expo-router';
import { LoadingView } from '@/components/LoadingView';
import { ErrorView } from '@/components/ErrorView';
import { EmptyStateView } from '@/components/EmptyStateView';
import RequireAuth from '@/components/RequireAuth';
import { Card as ShadcnCard, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
        className="mb-6 group animate-fade-in"
        accessibilityLabel={`View details for ${item.title}`}
        accessibilityRole="button"
      >
        <ShadcnCard className="overflow-hidden bg-white border border-gray-100 shadow-soft hover-lift transition-all duration-300 rounded-xl">
          {item.imageUrl && (
            <View className="relative overflow-hidden">
              <Image
                source={{ uri: item.imageUrl }}
                style={{ width: '100%', height: 240 }}
                resizeMode="cover"
                className="group-hover:scale-105 transition-transform duration-500"
                accessibilityLabel={`Image of ${item.title}`}
              />
              <View className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </View>
          )}
          
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-bold text-gray-900 leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-200">
              {item.title}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-3 pt-0">
            <View className="flex-row items-center space-x-2">
              <View className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                <Text className="text-xs">📍</Text>
              </View>
              <Text className="text-sm font-medium text-gray-700 flex-1">{item.location}</Text>
            </View>
            
            {item.description && (
              <Text className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                {item.description}
              </Text>
            )}
            
            {item.tags && item.tags.length > 0 && (
              <View className="flex-row flex-wrap gap-2 pt-2">
                {item.tags.map((tag) => (
                  <Badge 
                    key={tag} 
                    variant="outline" 
                    className="text-xs px-3 py-1 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 text-primary font-medium hover:from-primary/10 hover:to-primary/20 transition-all duration-200"
                  >
                    {tag}
                  </Badge>
                ))}
              </View>
            )}
            
            <View className="flex-row items-center justify-between pt-2 border-t border-gray-100">
              <View className="flex-row items-center space-x-2">
                <View className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <Text className="text-xs font-medium text-gray-500">Active</Text>
              </View>
              <Text className="text-xs text-gray-400 font-medium">{formatDate(item.createdAt)}</Text>
            </View>
          </CardContent>
        </ShadcnCard>
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
        <View className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 px-6 py-3 border-b border-primary/10 backdrop-blur-sm">
          <View className="flex-row items-center justify-center space-x-2">
            <View className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <Text className="text-xs font-semibold text-gray-700">
              Loaded <Text className="text-primary font-bold">{items.length}</Text> items in <Text className="text-primary font-bold">{loadTime}ms</Text>
            </Text>
          </View>
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
    <View className="glass border-b border-gray-200/50 sticky top-0 z-50 backdrop-blur-xl bg-white/80">
      <View className="max-w-7xl mx-auto px-6 py-4 flex-row justify-between items-center">
        <View className="flex-row items-center space-x-3">
          <View className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
            <Text className="text-white font-bold text-lg">L</Text>
          </View>
          <View>
            <Text className="text-2xl font-bold text-gradient bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              LostLink
            </Text>
            <Text className="text-xs text-gray-500 font-medium">Lost & Found Platform</Text>
          </View>
        </View>
        <View className="flex-row items-center space-x-4">
          <View className="hidden md:flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-50">
            <View className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <Text className="text-sm font-medium text-gray-700">{items.length} items</Text>
          </View>
          <Button 
            variant="ghost" 
            onPress={logout} 
            className="text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-lg transition-colors duration-200"
          >
            <Text className="font-medium">Logout</Text>
          </Button>
        </View>
      </View>
    </View>
  ) : null;

  return (
    <View style={styles.container} className={isWeb ? "bg-gradient-to-br from-gray-50 via-white to-gray-50 min-h-screen" : ""}>
      {WebHeader}
      {!isWeb && (
        <Appbar.Header>
          <Appbar.Content title="LostLink" />
          <Appbar.Action icon="logout" onPress={logout} accessibilityLabel="Logout" />
        </Appbar.Header>
      )}

      {items.length === 0 ? (
        <View className={isWeb ? "flex-1 flex items-center justify-center px-6 py-20" : ""}>
          <View className={isWeb ? "max-w-md w-full text-center space-y-6" : ""}>
            <View className={isWeb ? "w-24 h-24 mx-auto rounded-full bg-gradient-primary flex items-center justify-center shadow-soft mb-4" : ""}>
              <Text className={isWeb ? "text-5xl" : ""}>📦</Text>
            </View>
            <View>
              <Text className={isWeb ? "text-3xl font-bold text-gray-900 mb-3" : ""}>
                No items found yet
              </Text>
              <Text className={isWeb ? "text-gray-600 leading-relaxed mb-8" : ""}>
                Be the first to report a found item and help someone recover their lost belongings!
              </Text>
            </View>
            <Button 
              onPress={navigateToReport}
              className={isWeb ? "bg-gradient-primary text-white px-8 py-4 rounded-xl shadow-soft hover-lift font-semibold text-lg" : ""}
            >
              <Text className={isWeb ? "text-white font-semibold" : ""}>Report Found Item</Text>
            </Button>
          </View>
        </View>
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
