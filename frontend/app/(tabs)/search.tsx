import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { 
  Appbar, 
  Searchbar, 
  Card, 
  Text, 
  Chip, 
  ActivityIndicator,
  Button,
  Menu,
  Divider
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useApi } from '../../hooks/useApi';
import RequireAuth from '@/components/RequireAuth';

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
  };
}

function SearchScreen() {
  const router = useRouter();
  const { get } = useApi();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [popularLocations, setPopularLocations] = useState<string[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(true);

  // 위치 목록 로드
  useEffect(() => {
    const loadLocations = async () => {
      try {
        setLocationsLoading(true);
        const response = await get<{data: string[], total: number, source: string}>('/items/locations');
        setPopularLocations(response.data || []);
      } catch (error) {
        console.error('Failed to load locations:', error);
        // 오류 시 기본값 사용
        setPopularLocations([
          'Library', 'Cafeteria', 'Gym', 'Classroom', 'Parking Lot', 
          'Student Center', 'Dormitory', 'Bus Stop', 'Campus Store'
        ]);
      } finally {
        setLocationsLoading(false);
      }
    };

    loadLocations();
  }, [get]);

  // 디바운스된 검색
  const [debouncedQuery, setDebouncedQuery] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300); // 300ms 디바운스

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 검색 실행
  const performSearch = useCallback(async () => {
    if (!debouncedQuery.trim() && !selectedLocation) {
      setItems([]);
      setHasSearched(false);
      return;
    }

    try {
      setLoading(true);
      setHasSearched(true);
      
      const params = new URLSearchParams();
      if (debouncedQuery.trim()) {
        params.append('q', debouncedQuery.trim());
      }
      if (selectedLocation) {
        params.append('location', selectedLocation);
      }
      params.append('limit', '20'); // 검색 결과는 더 많이 표시

      const response = await get<ApiResponse>(`/items?${params.toString()}`);
      setItems(response.data || []);
    } catch (error) {
      console.error('Search failed:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, selectedLocation, get]);

  useEffect(() => {
    performSearch();
  }, [performSearch]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedLocation(null);
    setItems([]);
    setHasSearched(false);
  };

  const renderItem = ({ item }: { item: Item }) => (
    <TouchableOpacity onPress={() => router.push(`/item/${item._id}`)}>
      <Card style={styles.itemCard}>
        {item.imageUrl && (
          <Card.Cover source={{ uri: item.imageUrl }} style={styles.itemImage} />
        )}
        <Card.Content style={styles.cardContent}>
          <Text variant="titleMedium" style={styles.itemTitle}>
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
          <Text variant="bodySmall" style={styles.itemDate}>
            {new Date(item.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderLocationChip = (location: string) => (
    <Chip
      key={location}
      mode={selectedLocation === location ? 'flat' : 'outlined'}
      selected={selectedLocation === location}
      onPress={() => setSelectedLocation(selectedLocation === location ? null : location)}
      style={styles.locationChip}
    >
      {location}
    </Chip>
  );

  return (
    <RequireAuth>
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.Content title="Search Items" />
          {(searchQuery || selectedLocation) && (
            <Appbar.Action icon="close" onPress={clearFilters} />
          )}
        </Appbar.Header>

        <View style={styles.searchContainer}>
          {/* 검색바 */}
          <Searchbar
            placeholder="Search for items..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
            icon="magnify"
            clearIcon="close"
          />

          {/* 위치 필터 */}
          <View style={styles.filterSection}>
            <Text variant="labelLarge" style={styles.filterLabel}>
              Filter by Location:
            </Text>
            <View style={styles.locationChips}>
              {locationsLoading ? (
                <ActivityIndicator size="small" style={{ margin: 8 }} />
              ) : (
                popularLocations.map(renderLocationChip)
              )}
            </View>
          </View>
        </View>

        {/* 검색 결과 */}
        <View style={styles.resultsContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" />
              <Text style={styles.loadingText}>Searching...</Text>
            </View>
          ) : hasSearched ? (
            <>
              <View style={styles.resultsHeader}>
                <Text variant="titleMedium">
                  {items.length} result{items.length !== 1 ? 's' : ''} found
                </Text>
                {(searchQuery || selectedLocation) && (
                  <Text variant="bodySmall" style={styles.searchSummary}>
                    {searchQuery && `"${searchQuery}"`}
                    {searchQuery && selectedLocation && ' in '}
                    {selectedLocation && `${selectedLocation}`}
                  </Text>
                )}
              </View>
              
              <FlatList
                data={items}
                keyExtractor={(item) => item._id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Text variant="bodyLarge" style={styles.emptyText}>
                      No items found matching your search.
                    </Text>
                    <Text variant="bodySmall" style={styles.emptySubtext}>
                      Try different keywords or check the location filters.
                    </Text>
                  </View>
                }
              />
            </>
          ) : (
            <View style={styles.welcomeContainer}>
              <Text variant="headlineSmall" style={styles.welcomeTitle}>
                🔍 Search Lost Items
              </Text>
              <Text variant="bodyMedium" style={styles.welcomeText}>
                Use the search bar above to find specific items, or filter by location to see what's been found nearby.
              </Text>
              <View style={styles.tipsContainer}>
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
              </View>
            </View>
          )}
        </View>
      </View>
    </RequireAuth>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
  },
  searchbar: {
    marginBottom: 16,
  },
  filterSection: {
    marginBottom: 8,
  },
  filterLabel: {
    marginBottom: 8,
    color: '#666',
  },
  locationChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  locationChip: {
    marginRight: 4,
    marginBottom: 4,
  },
  resultsContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
  },
  resultsHeader: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchSummary: {
    color: '#666',
    marginTop: 4,
  },
  listContainer: {
    padding: 16,
  },
  itemCard: {
    marginBottom: 12,
  },
  itemImage: {
    height: 120,
  },
  cardContent: {
    padding: 12,
  },
  itemTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemLocation: {
    color: '#666',
    marginBottom: 4,
  },
  itemDescription: {
    color: '#888',
    marginBottom: 4,
    lineHeight: 18,
  },
  itemDate: {
    color: '#999',
    fontSize: 12,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 8,
    color: '#666',
  },
  emptySubtext: {
    textAlign: 'center',
    color: '#888',
  },
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
  },
  welcomeText: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
    lineHeight: 22,
  },
  tipsContainer: {
    alignSelf: 'stretch',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    elevation: 1,
  },
  tipsTitle: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  tipText: {
    color: '#666',
    marginBottom: 4,
    paddingLeft: 8,
  },
});

export default SearchScreen; 