import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { movieService, getImageUrl } from '../services/movieService';
import { useFavorites } from '../utils/FavoritesContext';
import { LoadingSpinner } from '../components/LoadingSpinner';

const { width, height } = Dimensions.get('window');

export const MovieDetailsScreen = ({ route, navigation }) => {
  const { movie: initialMovie } = route.params;
  const [movieDetails, setMovieDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    loadMovieDetails();
  }, [initialMovie.id]);

  const loadMovieDetails = async () => {
    try {
      setLoading(true);
      setError(false);
      const details = await movieService.getMovieDetails(initialMovie.id);
      setMovieDetails(details);
    } catch (error) {
      console.error('Error loading movie details:', error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleFavoritePress = useCallback(() => {
    toggleFavorite(initialMovie);
  }, [toggleFavorite, initialMovie]);

  const formatRuntime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return <LoadingSpinner message="Loading movie details..." />;
  }

  if (error || !movieDetails) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>😔</Text>
        <Text style={styles.errorTitle}>Oops!</Text>
        <Text style={styles.errorText}>Failed to load movie details</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadMovieDetails}>
          <Text style={styles.retryButtonText}>🔄 Try Again</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Backdrop Image */}
      <View style={styles.backdropContainer}>
        <Image
          source={{ uri: getImageUrl(movieDetails.backdrop_path, 'original') }}
          style={styles.backdrop}
          resizeMode="cover"
        />
        <View style={styles.backdropOverlay} />
        
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        {/* Favorite Button */}
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={handleFavoritePress}
        >
          <Text style={styles.favoriteIcon}>
            {isFavorite(movieDetails.id) ? '❤️' : '🤍'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Movie Info */}
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{movieDetails.title}</Text>
        
        {movieDetails.tagline && (
          <Text style={styles.tagline}>"{movieDetails.tagline}"</Text>
        )}

        <View style={styles.metaContainer}>
          <Text style={styles.releaseDate}>
            {new Date(movieDetails.release_date).getFullYear()}
          </Text>
          <Text style={styles.separator}>•</Text>
          <Text style={styles.runtime}>
            {formatRuntime(movieDetails.runtime)}
          </Text>
          <Text style={styles.separator}>•</Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.rating}>⭐ {movieDetails.vote_average.toFixed(1)}</Text>
          </View>
        </View>

        {/* Genres */}
        <View style={styles.genresContainer}>
          {movieDetails.genres.map((genre) => (
            <View key={genre.id} style={styles.genreTag}>
              <Text style={styles.genreText}>{genre.name}</Text>
            </View>
          ))}
        </View>

        {/* Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <Text style={styles.overview}>{movieDetails.overview}</Text>
        </View>

        {/* Additional Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Information</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status:</Text>
            <Text style={styles.infoValue}>{movieDetails.status}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Budget:</Text>
            <Text style={styles.infoValue}>
              {movieDetails.budget > 0 ? formatCurrency(movieDetails.budget) : 'N/A'}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Revenue:</Text>
            <Text style={styles.infoValue}>
              {movieDetails.revenue > 0 ? formatCurrency(movieDetails.revenue) : 'N/A'}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Original Language:</Text>
            <Text style={styles.infoValue}>{movieDetails.original_language.toUpperCase()}</Text>
          </View>
        </View>

        {/* Production Companies */}
        {movieDetails.production_companies.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Production Companies</Text>
            {movieDetails.production_companies.map((company) => (
              <Text key={company.id} style={styles.companyText}>
                • {company.name}
              </Text>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backdropContainer: {
    height: height * 0.4,
    position: 'relative',
  },
  backdrop: {
    width: '100%',
    height: '100%',
  },
  backdropOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  favoriteButton: {
    position: 'absolute',
    top: 50,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteIcon: {
    fontSize: 24,
  },
  contentContainer: {
    padding: 20,
    marginTop: -50,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    minHeight: height * 0.7,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    lineHeight: 34,
  },
  tagline: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  releaseDate: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  separator: {
    fontSize: 16,
    color: '#999',
    marginHorizontal: 8,
  },
  runtime: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 16,
    color: '#FF6B35',
    fontWeight: '600',
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  genreTag: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  genreText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  overview: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    width: 120,
  },
  infoValue: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  companyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  backButtonText: {
    color: '#FF6B35',
    fontSize: 16,
    fontWeight: '600',
  },
});
