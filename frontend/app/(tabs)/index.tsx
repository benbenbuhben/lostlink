import * as React from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { Appbar, Button, Card, Text } from 'react-native-paper';
import { useAuth } from '@/context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { useRouter } from 'expo-router';

interface Item {
  _id: string;
  title: string;
  location: string;
  description?: string;
  imageUrl?: string;
  createdAt: string;
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

function FeedScreen() {
  const { user, login, logout, ready } = useAuth();
  const { get } = useApi();
  const router = useRouter();
  
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadTime, setLoadTime] = useState<number | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      const startTime = Date.now();
      setLoading(true);
      console.log('Fetching items from API...');
      
      // 캐시 최적화를 위해 limit을 늘림
      const response = await get<ApiResponse>('/items?limit=20');
      console.log('API response:', response);
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      setLoadTime(totalTime);
      
      // 성능 로깅
      console.log(`Feed loaded in ${totalTime}ms (Backend: ${response.pagination.queryTime || 'N/A'}ms)`);
      
      setItems(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch items:', err);
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [get]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchItems();
  }, [fetchItems]);

  // 메모이제이션된 렌더 함수
  const renderItem = useCallback(({ item }: { item: Item }) => (
    <TouchableOpacity onPress={() => router.push(`/item/${item._id}`)}>
      <Card style={styles.itemCard}>
        {item.imageUrl && (
          <Card.Cover source={{ uri: item.imageUrl }} style={styles.itemImage} />
        )}
        <Card.Title title={item.title} subtitle={item.location} />
        {item.description && (
          <Card.Content>
            <Text numberOfLines={2}>{item.description}</Text>
          </Card.Content>
        )}
      </Card>
    </TouchableOpacity>
  ), [router]);

  // 키 추출 함수 메모이제이션
  const keyExtractor = useCallback((item: Item) => item._id, []);

  // 성능 지표 표시 (개발 모드에서만)
  const performanceInfo = useMemo(() => {
    if (!loadTime || process.env.NODE_ENV === 'production') return null;
    
    const isGood = loadTime < 1000;
    const color = isGood ? '#4CAF50' : loadTime < 2000 ? '#FF9800' : '#F44336';
    
    return (
      <Text style={[styles.performanceText, { color }]}>
        Load time: {loadTime}ms {isGood ? '✅' : '⚠️'}
      </Text>
    );
  }, [loadTime]);

  useEffect(() => {
    if (ready && user) {
      fetchItems();
    }
  }, [ready, user, fetchItems]);

  if (!ready) {
    return null; // Avoid flicker while restoring session
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.Content title="LostLink" />
        </Appbar.Header>
        <View style={styles.content}>
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="headlineLarge" style={styles.title}>
                Welcome to LostLink
              </Text>
              <Text variant="bodyMedium" style={styles.subtitle}>
                The easiest way to report, browse, and claim lost &amp; found items in your community.
              </Text>
              <Button
                mode="contained"
                onPress={login}
                style={styles.button}
                contentStyle={{ paddingVertical: 8 }}
                icon="login"
              >
                Login with Auth0
              </Button>
            </Card.Content>
          </Card>
        </View>
      </View>
    );
  }

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading items...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 16 }]}>
        <Text>문제가 발생했습니다: {error}</Text>
        <Button mode="contained" onPress={fetchItems} style={{ marginTop: 12 }}>
          다시 시도
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title={`Feed (${items.length} items)`} />
        {performanceInfo}
        <Appbar.Action icon="refresh" onPress={fetchItems} />
        <Appbar.Action icon="logout" onPress={logout} />
      </Appbar.Header>
      <FlatList
        data={items}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text>No items found. Try reporting a found item!</Text>
          </View>
        }
        // 성능 최적화 props
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={10}
        windowSize={10}
        getItemLayout={(data, index) => ({
          length: 200, // 예상 아이템 높이
          offset: 200 * index,
          index,
        })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f6f6",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    elevation: 4,
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  title: {
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    marginBottom: 24,
    textAlign: "center",
    color: "#666",
  },
  button: {
    alignSelf: "center",
    borderRadius: 8,
    minWidth: 160,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
  },
  itemCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    elevation: 4,
    borderRadius: 16,
  },
  itemImage: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  listContainer: {
    paddingVertical: 8,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  performanceText: {
    marginRight: 12,
  },
});

export default FeedScreen;