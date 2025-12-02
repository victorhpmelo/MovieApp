import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Text,
  TouchableOpacity,
} from 'react-native';
import { movieService } from '../services/movieService';
import { useFavorites } from '../utils/FavoritesContext';
import { MovieCard } from '../components/MovieCard';
import { SearchBar } from '../components/SearchBar';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const MovieListScreen = ({ navigation }) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearchQuery, setActiveSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const { isFavorite, toggleFavorite } = useFavorites();

  const loadMovies = useCallback(async (pageNum = 1, isRefresh = false, query = '') => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      // Clear previous error when starting new request
      setError(null);

      let response;
      if (query.trim()) {
        response = await movieService.searchMovies({
          query: query,
          page: pageNum,
        });
      } else {
        response = await movieService.getPopularMovies({
          page: pageNum,
        });
      }

      if (pageNum === 1) {
        setMovies(response.results);
      } else {
        setMovies(prev => [...prev, ...response.results]);
      }

      setHasMore(pageNum < response.total_pages);
      setPage(pageNum);
    } catch (error) {
      console.error('Error loading movies:', error);
      // Only show alert for initial load, not for pagination/refresh
      if (pageNum === 1 && !isRefresh) {
        setError('Failed to load movies. Pull to refresh or try again.');
      } else {
        // For pagination errors, just stop loading more
        setHasMore(false);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, []);

  // Load initial movies on mount
  useEffect(() => {
    loadMovies(1);
  }, []);

  const handleRefresh = useCallback(() => {
    setPage(1);
    loadMovies(1, true, activeSearchQuery);
  }, [loadMovies, activeSearchQuery]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !loadingMore) {
      loadMovies(page + 1, false, activeSearchQuery);
    }
  }, [hasMore, loadingMore, page, loadMovies, activeSearchQuery]);

  const handleSearch = useCallback(() => {
    // Only search if there's a query or if clearing back to popular
    setActiveSearchQuery(searchQuery);
    setPage(1);
    loadMovies(1, false, searchQuery);
  }, [loadMovies, searchQuery]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setActiveSearchQuery('');
    setPage(1);
    loadMovies(1, false, '');
  }, [loadMovies]);

  const handleMoviePress = useCallback((movie) => {
    navigation.navigate('MovieDetails', { movie });
  }, [navigation]);

  const handleFavoritePress = useCallback((movie) => {
    toggleFavorite(movie);
  }, [toggleFavorite]);

  const renderMovie = useCallback(({ item }) => (
    <MovieCard
      movie={item}
      onPress={handleMoviePress}
      onFavoritePress={handleFavoritePress}
      isFavorite={isFavorite(item.id)}
    />
  ), [handleMoviePress, handleFavoritePress, isFavorite]);

  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <LoadingSpinner size="small" message="Loading more..." />
      </View>
    );
  }, [loadingMore]);

  const renderEmpty = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🎬</Text>
      <Text style={styles.emptyText}>
        {activeSearchQuery ? 'No movies found for your search.' : 'No movies available.'}
      </Text>
      {activeSearchQuery && (
        <Text style={styles.emptyHint}>Try a different search term</Text>
      )}
    </View>
  ), [activeSearchQuery]);

  const renderHeader = useCallback(() => {
    if (activeSearchQuery) return null;
    return (
      <View style={styles.bannerContainer}>
        <Text style={styles.bannerTitle}>🎬 Discover Movies</Text>
        <Text style={styles.bannerSubtitle}>
          Explore thousands of movies and find your next favorite
        </Text>
      </View>
    );
  }, [activeSearchQuery]);

  if (loading) {
    return <LoadingSpinner message="Loading movies..." />;
  }

  return (
    <View style={styles.container}>
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSearch={handleSearch}
        onClear={handleClearSearch}
      />
      
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.errorCloseButton}
            onPress={() => setError(null)}
          >
            <Text style={styles.errorCloseText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <FlatList
        data={movies}
        renderItem={renderMovie}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#FF6B35']}
            tintColor="#FF6B35"
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  row: {
    justifyContent: 'space-between',
  },
  footerLoader: {
    paddingVertical: 20,
  },
  bannerContainer: {
    backgroundColor: '#fff',
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyHint: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  errorBanner: {
    backgroundColor: '#fee',
    borderLeftWidth: 4,
    borderLeftColor: '#f44',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  errorIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: '#c33',
    fontWeight: '500',
  },
  errorCloseButton: {
    padding: 4,
    marginLeft: 8,
  },
  errorCloseText: {
    fontSize: 18,
    color: '#c33',
    fontWeight: 'bold',
  },
});

