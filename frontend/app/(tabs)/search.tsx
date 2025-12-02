import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {
  Searchbar,
  Card,
  Text,
  Chip,
  Appbar,
} from 'react-native-paper';
import { useRouter, useFocusEffect } from 'expo-router';
import { useApi } from '../../hooks/useApi';
import { LoadingView } from '@/components/LoadingView';
import { ErrorView } from '@/components/ErrorView';
import { EmptyStateView } from '@/components/EmptyStateView';
import RequireAuth from '@/components/RequireAuth';
import { useAuth } from '../../context/AuthContext';
import Highlighter from '@/components/Highlighter';

interface Item {
  _id: string;
  title: string;
  location: string;
  description?: string;
  imageUrl?: string;
  createdAt: string;
  tags?: string[];
}

interface SearchResponse {
  data: Item[];
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}

interface LocationsResponse {
  data: string[];
  total: number;
  source: string;
  queryTime?: number;
}

const { width: screenWidth } = Dimensions.get('window');

function SearchScreen() {
  const router = useRouter();
  const { get } = useApi();
  const { logout } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSearchTime, setLastSearchTime] = useState<number | null>(null);
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(true);

  /* ------------- highlight words (memo) ------------- */
  const highlightWords = useMemo(
    () =>
      searchQuery
        .trim()
        .split(/\s+/)
        .filter(Boolean),
    [searchQuery],
  );

  /* ------------- load locations ------------- */
  const loadLocations = useCallback(async () => {
    try {
      setLocationsLoading(true);
      const response = await get<LocationsResponse>('/items/locations');
      setAvailableLocations(response.data || []);
    } catch (err) {
      setAvailableLocations([]);
    } finally {
      setLocationsLoading(false);
    }
  }, [get]);

  useEffect(() => {
    loadLocations();
  }, [loadLocations]);

  useFocusEffect(
    useCallback(() => {
      loadLocations();
    }, [loadLocations]),
  );

  /* ------------- search ------------- */
  const performSearch = useCallback(
    async (
      query: string = searchQuery,
      location: string = selectedLocation,
    ) => {
      if (!query.trim() && !location) {
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const startTime = Date.now();

        const params = new URLSearchParams();
        if (query.trim()) params.append('q', query.trim());
        if (location) params.append('location', location);

        const response = await get<SearchResponse>(
          '/items?' + params.toString(),
        );

        const searchTime = Date.now() - startTime;
        setItems(response.data || []);
        setHasSearched(true);
        setLastSearchTime(searchTime);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Search failed',
        );
        setItems([]);
        setHasSearched(true);
      } finally {
        setLoading(false);
      }
    },
    [get, searchQuery, selectedLocation],
  );

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      if (query.trim().length >= 2 || selectedLocation) {
        performSearch(query, selectedLocation);
      } else if (query.trim().length === 0 && !selectedLocation) {
        setItems([]);
        setHasSearched(false);
        setError(null);
      }
    },
    [selectedLocation, performSearch],
  );

  const handleLocationSelect = useCallback(
    (loc: string) => {
      // toggle chip state
      const nextLoc = selectedLocation === loc ? '' : loc;
      setSelectedLocation(nextLoc);

      const queryTrimmed = searchQuery.trim();

      if (!queryTrimmed && !nextLoc) {
        // nothing to search for → clear results completely
        setItems([]);
        setHasSearched(false);
        setError(null);
        setLastSearchTime(null);
        return;
      }

      // otherwise (chip turned on, or query present) → (re)fetch
      performSearch(queryTrimmed, nextLoc);
    },
    [selectedLocation, searchQuery, performSearch],
  );

  const handleItemPress = useCallback(
    (itemId: string) => {
      router.push(`/item/${itemId}`);
    },
    [router],
  );

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSelectedLocation('');
    setItems([]);
    setHasSearched(false);
    setError(null);
    setLastSearchTime(null);
  }, []);

  /* ------------- render item ------------- */
  const renderItem = useCallback(
    ({ item }: { item: Item }) => {
      const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor(
          (now.getTime() - date.getTime()) / (1000 * 60 * 60),
        );
        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${diffInHours}h ago`;
        return date.toLocaleDateString();
      };

      return (
        <TouchableOpacity
          onPress={() => handleItemPress(item._id)}
          accessibilityLabel={`View details for ${item.title} found at ${item.location}`}
          accessibilityRole="button"
          testID={`search-result-${item._id}`}
        >
          <Card style={styles.itemCard} elevation={2}>
            {item.imageUrl && (
              <Card.Cover
                source={{ uri: item.imageUrl }}
                style={styles.itemImage}
                accessibilityLabel={`Image of ${item.title}`}
              />
            )}
            <Card.Content style={styles.cardContent}>
              {/* title */}
              <Highlighter
                text={item.title}
                searchWords={highlightWords}
                highlightStyle={styles.highlight}
                textStyle={styles.itemTitle}
              />
              {/* location */}
              <Highlighter
                text={`📍 ${item.location}`}
                searchWords={highlightWords}
                highlightStyle={styles.highlight}
                textStyle={styles.itemLocation}
              />
              {/* description */}
              {item.description && (
                <Highlighter
                  text={item.description}
                  searchWords={highlightWords}
                  highlightStyle={styles.highlight}
                  textStyle={styles.itemDescription}
                />
              )}
              {/* auto-tags */}
              {(item.tags?.length ?? 0) > 0 && (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 }}>
                  {(item.tags ?? []).map(tag => (
                    <Chip
                      key={tag}
                      mode="outlined"
                      style={{ marginRight: 4, marginBottom: 4 }}
                    >
                      <Highlighter
                        text={tag}
                        searchWords={highlightWords}
                        highlightStyle={styles.highlight}
                      />
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
    },
    [handleItemPress, highlightWords],
  );

  /* ------------- performance info ------------- */
  const SearchPerformanceInfo = useMemo(() => {
    if (!lastSearchTime || !hasSearched) return null;
    return (
      <View style={styles.performanceContainer}>
        <Text variant="bodySmall" style={styles.performanceText}>
          Found {items.length} result
          {items.length !== 1 ? 's' : ''} in {lastSearchTime}ms
        </Text>
      </View>
    );
  }, [lastSearchTime, items.length, hasSearched]);

  /* ------------- results ------------- */
  const SearchResults = useMemo(() => {
    if (loading)
      return (
        <LoadingView message="Searching items..." size="large" />
      );

    if (error)
      return (
        <ErrorView
          title="Search failed"
          message={error}
          onRetry={performSearch}
          retryLabel="Try Again"
        />
      );

    if (hasSearched && items.length === 0)
      return (
        <EmptyStateView
          emoji="🔍"
          title="No items found"
          description="Try different keywords or check the location filters. New items are added regularly!"
          actionLabel="Clear Search"
          onAction={clearSearch}
        />
      );

    if (hasSearched && items.length > 0)
      return (
        <>
          {SearchPerformanceInfo}
          <View style={styles.resultsHeader}>
            <Text variant="titleMedium">
              {items.length} result
              {items.length !== 1 ? 's' : ''} found
            </Text>
            {(searchQuery || selectedLocation) && (
              <Text
                variant="bodySmall"
                style={styles.searchSummary}
              >
                {searchQuery && `"${searchQuery}"`}
                {searchQuery && selectedLocation && ' in '}
                {selectedLocation && `${selectedLocation}`}
              </Text>
            )}
          </View>
          <FlatList
            data={items}
            keyExtractor={item => item._id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews
            maxToRenderPerBatch={10}
            windowSize={10}
          />
        </>
      );

    /* welcome */
    return (
      <View style={styles.welcomeContainer}>
        <Text
          variant="headlineSmall"
          style={styles.welcomeTitle}
        >
          🔍 Search Lost Items
        </Text>
        <Text variant="bodyMedium" style={styles.welcomeText}>
          Use the search bar above to find specific items, or filter
          by location to see what is nearby.
        </Text>
        <Card style={styles.tipsContainer} elevation={1}>
          <Card.Content>
            <Text variant="labelLarge" style={styles.tipsTitle}>
              Search Tips:
            </Text>
            <Text variant="bodySmall" style={styles.tipText}>
              • Try keywords like "wallet", "keys", "phone"
            </Text>
            <Text variant="bodySmall" style={styles.tipText}>
              • Use location filters to narrow down results
            </Text>
            <Text variant="bodySmall" style={styles.tipText}>
              • Check back regularly for new items
            </Text>
          </Card.Content>
        </Card>
      </View>
    );
  }, [
    loading,
    error,
    hasSearched,
    items,
    searchQuery,
    selectedLocation,
    performSearch,
    clearSearch,
    SearchPerformanceInfo,
    renderItem,
  ]);

  /* ------------- render ------------- */
  return (
    <RequireAuth>
      <View style={styles.outerContainer}>
        <Appbar.Header>
          <Appbar.Content title="Search Items" />
          <Appbar.Action
            icon="logout"
            onPress={logout}
            accessibilityLabel="Logout"
          />
        </Appbar.Header>

        <View style={styles.container}>
          {/* search header */}
          <View style={styles.searchContainer}>
            <Searchbar
              placeholder="Search for lost items..."
              value={searchQuery}
              onChangeText={handleSearch}
              style={styles.searchbar}
              accessibilityLabel="Search for items"
              testID="search-input"
            />

            {/* location chips */}
            <View style={styles.filterSection}>
              <Text
                variant="labelMedium"
                style={styles.filterLabel}
              >
                Filter by location:
              </Text>

              {locationsLoading ? (
                <View style={styles.loadingLocations}>
                  <Text
                    variant="bodySmall"
                    style={styles.loadingText}
                  >
                    Loading locations...
                  </Text>
                </View>
              ) : availableLocations.length > 0 ? (
                <View style={styles.locationChips}>
                  {availableLocations.map(location => (
                    <Chip
                      key={location}
                      mode={
                        selectedLocation === location
                          ? 'flat'
                          : 'outlined'
                      }
                      selected={selectedLocation === location}
                      onPress={() =>
                        handleLocationSelect(location)
                      }
                      style={styles.locationChip}
                      accessibilityLabel={`Filter by ${location}`}
                      testID={`location-filter-${location
                        .toLowerCase()
                        .replace(/\s+/g, '-')}`}
                    >
                      {location}
                    </Chip>
                  ))}
                </View>
              ) : (
                <Text
                  variant="bodySmall"
                  style={styles.noLocationsText}
                >
                  No locations available yet. Report some items to
                  see location filters!
                </Text>
              )}
            </View>
          </View>

          {/* results */}
          <View style={styles.resultsContainer}>
            {SearchResults}
          </View>
        </View>
      </View>
    </RequireAuth>
  );
}

/* ------------- styles ------------- */
const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: { flex: 1 },
  searchContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchbar: { marginBottom: 16, elevation: 0 },
  filterSection: { marginBottom: 8 },
  filterLabel: {
    marginBottom: 8,
    color: '#666',
    fontWeight: '500',
  },
  loadingLocations: { paddingVertical: 8 },
  loadingText: {
    color: '#888',
    fontStyle: 'italic',
  },
  locationChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  locationChip: { marginRight: 4, marginBottom: 4 },
  noLocationsText: {
    color: '#888',
    fontStyle: 'italic',
    paddingVertical: 8,
  },
  resultsContainer: { flex: 1 },
  performanceContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  performanceText: { color: '#666', fontSize: 12 },
  resultsHeader: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchSummary: { color: '#666', marginTop: 4 },
  listContainer: { padding: 16, paddingBottom: 100 },
  itemCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  itemImage: { height: 100 },
  cardContent: { padding: 12 },
  itemTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#1a1a1a',
  },
  itemLocation: { color: '#666', marginBottom: 4 },
  itemDescription: {
    color: '#888',
    marginBottom: 4,
    lineHeight: 18,
  },
  itemDate: { color: '#999', fontSize: 12 },
  welcomeContainer: {
    flex: 1,
    padding: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeTitle: {
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  welcomeText: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
    lineHeight: 22,
  },
  tipsContainer: { alignSelf: 'stretch', maxWidth: 400 },
  tipsTitle: {
    marginBottom: 8,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  tipText: { color: '#666', marginBottom: 4, paddingLeft: 8 },
  /* highlight style */
  highlight: {
    backgroundColor: '#fff29b',
  },
});

export default SearchScreen;
