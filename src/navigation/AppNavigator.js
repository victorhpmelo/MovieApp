import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { MovieListScreen } from '../screens/MovieListScreen';
import { MovieDetailsScreen } from '../screens/MovieDetailsScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { NearbyCinemasScreen } from '../screens/NearbyCinemasScreen';

const Stack = createStackNavigator();

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="MovieList"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#FF6B35',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
          },
          headerBackTitleVisible: false,
        }}
      >
        <Stack.Screen
          name="MovieList"
          component={MovieListScreen}
          options={({ navigation }) => ({
            title: 'Popular Movies',
            headerRight: () => (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity
                  style={{ marginRight: 16 }}
                  onPress={() => navigation.navigate('NearbyCinemas')}
                >
                  <Text style={{ color: '#fff', fontSize: 20 }}>📍</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ marginRight: 16 }}
                  onPress={() => navigation.navigate('Favorites')}
                >
                  <Text style={{ color: '#fff', fontSize: 20 }}>❤️</Text>
                </TouchableOpacity>
              </View>
            ),
          })}
        />
        <Stack.Screen
          name="MovieDetails"
          component={MovieDetailsScreen}
          options={({ route }) => ({
            title: route.params.movie.title,
            headerTitleStyle: {
              fontSize: 16,
            },
          })}
        />
        <Stack.Screen
          name="Favorites"
          component={FavoritesScreen}
          options={{
            title: 'My Favorites',
          }}
        />
        <Stack.Screen
          name="NearbyCinemas"
          component={NearbyCinemasScreen}
          options={{
            title: 'Nearby Cinemas',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
