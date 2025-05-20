import * as React from 'react';
import { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { Appbar, Button, Card, Text } from 'react-native-paper';
import { useAuth } from '@/context/AuthContext';
import { useApi } from '../../hooks/useApi';

interface Item {
  _id: string;
  title: string;
  location: string;
  description?: string;
  imageUrl?: string;
  createdAt: string;
}

function FeedScreen() {
  const { user, login, logout, ready } = useAuth();
  const { get } = useApi();
  
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const fetchItems = async () => {
    try {
      setLoading(true);

      const data = await get<Item[]>('/items');   // get에 타입 파라미터 지정
      setItems(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch items:', err);
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchItems();
  };

  useEffect(() => {
    if (ready && user){
      fetchItems();
    }
  }, [ready, user]);

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

  function renderItem({ item }: { item: any }) {
    return (
      <Card style={{ marginHorizontal: 16, marginVertical: 8 }}>
        {item.imageUrl ? <Card.Cover source={{ uri: item.imageUrl }} /> : null}
        <Card.Title title={item.title} subtitle={item.location} />
        {item.description ? (
          <Card.Content>
            <Text>{item.description}</Text>
          </Card.Content>
        ) : null}
      </Card>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Feed" />
        <Appbar.Action icon="refresh" onPress={fetchItems} />
        <Appbar.Action icon="logout" onPress={logout} />
      </Appbar.Header>
      <FlatList
        data={items}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingVertical: 8 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
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
});

export default FeedScreen;