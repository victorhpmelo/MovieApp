import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
  ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const NearbyCinemasScreen = ({ navigation }) => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cinemas, setCinemas] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      setLoading(true);
      
      // Request permission for location
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        Alert.alert(
          'Permission Denied',
          'Please enable location services to find nearby cinemas.',
          [{ text: 'OK' }]
        );
        setLoading(false);
        return;
      }

      // Get current location
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setLocation(currentLocation);

      // Get nearby cinemas (using mock data for demonstration)
      // In a real app, you would call an API like Google Places or Foursquare
      const nearbyCinemas = getMockCinemas(
        currentLocation.coords.latitude,
        currentLocation.coords.longitude
      );
      
      setCinemas(nearbyCinemas);
      setLoading(false);
    } catch (error) {
      console.error('Error getting location:', error);
      setErrorMsg('Error getting your location. Please try again.');
      Alert.alert('Error', 'Failed to get your location. Please try again.');
      setLoading(false);
    }
  };

  // Mock function to generate nearby cinemas
  // In production, replace with actual API call (Google Places, Foursquare, etc.)
  const getMockCinemas = (latitude, longitude) => {
    const cinemaChains = [
      'Cinemark', 'AMC', 'Regal', 'Cinépolis', 'UCI Cinemas',
      'Kinoplex', 'Moviecom', 'Cinesystem', 'GNC Cinemas', 'Cineart'
    ];

    return cinemaChains.map((chain, index) => {
      // Generate random coordinates within ~5km radius
      const latOffset = (Math.random() - 0.5) * 0.05;
      const lonOffset = (Math.random() - 0.5) * 0.05;
      
      const cinemaLat = latitude + latOffset;
      const cinemaLon = longitude + lonOffset;
      
      // Calculate approximate distance
      const distance = calculateDistance(
        latitude,
        longitude,
        cinemaLat,
        cinemaLon
      );

      return {
        id: index + 1,
        name: `${chain} - Shopping Center ${index + 1}`,
        address: `${1000 + index * 100} Main Street, Downtown`,
        distance: distance.toFixed(1),
        latitude: cinemaLat,
        longitude: cinemaLon,
        phone: `(555) ${100 + index}-${1000 + index}`,
        rating: (3.5 + Math.random() * 1.5).toFixed(1),
      };
    }).sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
  };

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of Earth in kilometers
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance;
  };

  const toRad = (value) => {
    return (value * Math.PI) / 180;
  };

  const openMaps = useCallback((cinema) => {
    const scheme = Platform.select({
      ios: 'maps:',
      android: 'geo:',
    });
    const url = Platform.select({
      ios: `${scheme}?q=${cinema.latitude},${cinema.longitude}`,
      android: `${scheme}${cinema.latitude},${cinema.longitude}?q=${cinema.name}`,
    });

    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot open maps application');
      }
    });
  }, []);

  const callCinema = useCallback((phone) => {
    const url = `tel:${phone}`;
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot make phone calls on this device');
      }
    });
  }, []);

  const renderCinemaItem = ({ item }) => (
    <View style={styles.cinemaCard}>
      <View style={styles.cinemaHeader}>
        <View style={styles.cinemaInfo}>
          <Text style={styles.cinemaName}>{item.name}</Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingStar}>⭐</Text>
            <Text style={styles.rating}>{item.rating}</Text>
          </View>
        </View>
        <View style={styles.distanceContainer}>
          <Text style={styles.distance}>{item.distance} km</Text>
        </View>
      </View>
      
      <Text style={styles.address}>📍 {item.address}</Text>
      <Text style={styles.phone}>📞 {item.phone}</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.directionsButton]}
          onPress={() => openMaps(item)}
        >
          <Text style={styles.buttonText}>🗺️ Directions</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.callButton]}
          onPress={() => callCinema(item.phone)}
        >
          <Text style={styles.buttonText}>📞 Call</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>Nearby Cinemas</Text>
      {location && (
        <View style={styles.locationInfo}>
          <Text style={styles.locationIcon}>📍</Text>
          <Text style={styles.locationText}>
            Your Location: {location.coords.latitude.toFixed(4)}, {location.coords.longitude.toFixed(4)}
          </Text>
        </View>
      )}
      <Text style={styles.headerSubtitle}>
        {cinemas.length} cinema{cinemas.length !== 1 ? 's' : ''} found nearby
      </Text>
    </View>
  );

  if (loading) {
    return <LoadingSpinner message="Getting your location..." />;
  }

  if (errorMsg) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>📍</Text>
        <Text style={styles.errorTitle}>Location Error</Text>
        <Text style={styles.errorText}>{errorMsg}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={requestLocationPermission}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={cinemas}
        renderItem={renderCinemaItem}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContainer}
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
    padding: 16,
  },
  headerContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    backgroundColor: '#f0f8ff',
    padding: 10,
    borderRadius: 8,
  },
  locationIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  locationText: {
    flex: 1,
    fontSize: 13,
    color: '#555',
    fontWeight: '500',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  cinemaCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cinemaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cinemaInfo: {
    flex: 1,
    marginRight: 12,
  },
  cinemaName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingStar: {
    fontSize: 14,
    marginRight: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B35',
  },
  distanceContainer: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  distance: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  address: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
    lineHeight: 20,
  },
  phone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  directionsButton: {
    backgroundColor: '#4CAF50',
    marginRight: 8,
  },
  callButton: {
    backgroundColor: '#2196F3',
    marginLeft: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#f8f9fa',
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
