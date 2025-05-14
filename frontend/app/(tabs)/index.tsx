import * as React from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { Appbar, Button, Card, Text } from 'react-native-paper';
import { useAuth } from '@/context/AuthContext';
import { useItems } from '@/hooks/useItems';

function FeedScreen() {
  const { user, login, logout, ready } = useAuth();
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    refetch,
    isFetchingNextPage,
  } = useItems();

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

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 24 }]}>
        <Text>Error loading items. Please try again.</Text>
        <Button mode="contained" onPress={() => refetch()} style={{ marginTop: 12 }}>
          Retry
        </Button>
      </View>
    );
  }

  const items = data?.pages.flatMap((p) => p.data) ?? [];

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
        <Appbar.Action icon="refresh" onPress={() => refetch()} />
        <Appbar.Action icon="logout" onPress={logout} />
      </Appbar.Header>
      <FlatList
        data={items}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingVertical: 8 }}
        onEndReached={() => hasNextPage && fetchNextPage()}
        onEndReachedThreshold={0.2}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => refetch()} />}
        ListFooterComponent={
          isFetchingNextPage ? <ActivityIndicator style={{ marginVertical: 16 }} /> : null
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
});

export default FeedScreen;