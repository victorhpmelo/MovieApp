import axios from 'axios';

const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = 'e1dcf96cfa98b76b809984116dfa9775'; // Replace with your TMDB API key

const api = axios.create({
  baseURL: API_BASE_URL,
  params: {
    api_key: API_KEY,
  },
});

export const movieService = {
  // Get popular movies
  getPopularMovies: async (params = {}) => {
    try {
      const response = await api.get('/movie/popular', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching popular movies:', error);
      throw error;
    }
  },

  // Get movie details by ID
  getMovieDetails: async (movieId) => {
    try {
      const response = await api.get(`/movie/${movieId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching movie details:', error);
      throw error;
    }
  },

  // Search movies by query
  searchMovies: async (params) => {
    try {
      const response = await api.get('/search/movie', { params });
      return response.data;
    } catch (error) {
      console.error('Error searching movies:', error);
      throw error;
    }
  },

  // Get movie genres
  getGenres: async () => {
    try {
      const response = await api.get('/genre/movie/list');
      return response.data;
    } catch (error) {
      console.error('Error fetching genres:', error);
      throw error;
    }
  },

  // Get movies by genre
  getMoviesByGenre: async (genreId, page = 1) => {
    try {
      const response = await api.get('/discover/movie', {
        params: {
          with_genres: genreId,
          page,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching movies by genre:', error);
      throw error;
    }
  },
};

// Helper function to get full image URL
export const getImageUrl = (path, size = 'w500') => {
  if (!path) return 'https://via.placeholder.com/500x750?text=No+Image';
  return `https://image.tmdb.org/t/p/${size}${path}`;
};
