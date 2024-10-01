import React, { useState, useEffect } from 'react';
import { FlatList, View, Image, Text, StyleSheet, ActivityIndicator, Modal, SafeAreaView } from 'react-native';
import { Card, Title, Searchbar, Menu, IconButton, Button, Paragraph } from 'react-native-paper';
import { addToUserList } from './SuaLista';
import { useNavigation, useRoute } from '@react-navigation/native';

const API_KEY = 'b6b3738a3883cb0b8ad12e7ab27079f7';

const MoviesByGenre = () => {
  const route = useRoute();
  const genreId = route?.params?.genreId;
  const [genreName, setGenreName] = useState(route?.params?.genreName || ''); 
  const [movies, setMovies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleMenu, setVisibleMenu] = useState(null);
  const [visibleModal, setVisibleModal] = useState(false);
  const [movieDetails, setMovieDetails] = useState(null);
  const [cast, setCast] = useState([]);
  const [movieQueue, setMovieQueue] = useState([]);
  const [movieDurations, setMovieDurations] = useState({});

  const navigation = useNavigation();

  useEffect(() => {
    if (route?.params?.genreName) {
      setGenreName(route.params.genreName); 
    }
  }, [route?.params?.genreName]);

  useEffect(() => {
    if (genreId) {
      const fetchMovies = async () => {
        setLoading(true);
        try {
          const response = await fetch(
            `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=${genreId}`
          );
          const data = await response.json();
          setMovies(data.results);
          setFilteredMovies(data.results);

          const durations = {};
          for (const movie of data.results) {
            const detailResponse = await fetch(
              `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${API_KEY}`
            );
            const detailData = await detailResponse.json();
            durations[movie.id] = detailData.runtime; 
          }
          setMovieDurations(durations); 
        } catch (error) {
          console.error('Error fetching movies:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchMovies();
    }
  }, [genreId]);

  const onChangeSearch = (query) => {
    setSearchQuery(query);
    const filtered = movies.filter((movie) =>
      movie.title.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredMovies(filtered);
  };

  const openMenu = (movieId) => setVisibleMenu(movieId);
  const closeMenu = () => setVisibleMenu(null);

  const openModal = async (movieId) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}`
      );
      const data = await response.json();
      setMovieDetails(data);

      const creditsResponse = await fetch(
        `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${API_KEY}`
      );
      const creditsData = await creditsResponse.json();
      setCast(creditsData.cast.slice(0, 5)); 
      setVisibleModal(true);
    } catch (error) {
      console.error('Error fetching movie details or cast:', error);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setVisibleModal(false);
    setMovieDetails(null);
    setCast([]);
  };

  const addToQueue = async (movie) => {
    try {
      const addedMovie = await addToUserList(movie); 
      if (addedMovie) {
        console.log('Filme adicionado à lista com sucesso!');
        navigation.navigate('SuaLista');
      }
    } catch (error) {
      console.error('Erro ao adicionar o filme à lista:', error);
    }
  };

  if (!genreId) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Gênero não selecionado.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Pesquisar filmes da categoria"
        onChangeText={onChangeSearch}
        value={searchQuery}
        style={styles.searchbar}
      />

      <Title style={styles.genreTitle}>{genreName}</Title>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loadingIndicator} />
      ) : (
        <FlatList
          data={filteredMovies}
          keyExtractor={(movie) => movie.id.toString()}
          renderItem={({ item: movie }) => (
            <Card key={movie.id} style={styles.card}>
              <View style={styles.movieRow}>
                <Image
                  source={{ uri: `https://image.tmdb.org/t/p/w200${movie.poster_path}` }}
                  style={styles.poster}
                  resizeMode="cover"
                />
                <View style={styles.details}>
                  <Title>{movie.title}</Title>
                  <Text style={styles.description}>{movie.release_date}</Text>
                  <Paragraph>Duração: {movieDurations[movie.id] ? `${movieDurations[movie.id]} minutos` : 'Duração não disponível'}</Paragraph>
                  <Text style={{ fontStyle: 'italic' }}>
                    Nota: <Text style={{ color: '#F8E5B7' }}>{movie.vote_average.toFixed(1)}</Text>
                  </Text>
                  <Text style={{ fontStyle: 'italic' }}>Número de Votos: {movie.vote_count}</Text>
                </View>

                <Menu
                  visible={visibleMenu === movie.id}
                  onDismiss={closeMenu}
                  anchor={
                    <IconButton
                      icon="dots-vertical"
                      size={24}
                      onPress={() => openMenu(movie.id)}
                    />
                  }
                >
                  <Menu.Item
                    onPress={() => {
                      closeMenu();
                      openModal(movie.id);
                    }}
                    leadingIcon="information-outline"
                    title="Ver Detalhes"
                  />
                  <Menu.Item
                    onPress={() => {
                      addToQueue(movie);
                      navigation.navigate('SuaLista');
                      closeMenu();
                    }}
                    leadingIcon="playlist-plus"
                    title="Adicionar à Lista"
                  />
                  <Menu.Item
                    onPress={closeMenu}
                    leadingIcon="cancel"
                    title="Cancelar"
                  />
                </Menu>
              </View>
            </Card>
          )}
        />
      )}

      <Modal
        visible={visibleModal}
        transparent={true}
        animationType="slide"
        onRequestClose={closeModal}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {loading ? (
              <ActivityIndicator size="large" color="#0000ff" />
            ) : (
              <>
                {movieDetails && (
                  <>
                    <Image
                      source={{ uri: `https://image.tmdb.org/t/p/w500${movieDetails.poster_path}` }}
                      style={styles.modalPoster}
                      resizeMode="cover"
                    />
                    <Title style={styles.modalTitle}>{movieDetails.title}</Title>
                    <Text style={styles.modalDescription}>{movieDetails.release_date}</Text>
                    <Text style={styles.modalDescription}>{movieDetails.overview}</Text>
                    <Title style={styles.modalSubtitle}>Atores</Title>
                    {cast.length > 0 ? (
                      cast.map((actor) => (
                        <Text key={actor.id} style={styles.modalDescription}>
                          {actor.name} como {actor.character}
                        </Text>
                      ))
                    ) : (
                      <Text style={styles.modalDescription}>Elenco não disponível</Text>
                    )}
                    <Button mode="contained" onPress={closeModal} style={styles.closeButton}>
                      Fechar
                    </Button>
                  </>
                )}
              </>
            )}
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 10,
  },
  searchbar: {
    marginBottom: 20,
  },
  loadingIndicator: {
    marginTop: 20,
  },
  genreTitle: {
    textAlign: 'center',
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#222'
  },
  card: {
    marginBottom: 10,
    elevation: 4, // Adiciona uma sombra leve ao Card
    borderRadius: 10,
  },
  movieRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  poster: {
    width: 100,
    height: 150,
    borderRadius: 5,
  },
  details: {
    flex: 1,
    marginLeft: 10,
    padding:3
  },
  description: {
    color: '#757575',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    margin: 20,
    borderRadius: 10,
  },
  modalPoster: {
    width: '100%',
    height: 300,
    borderRadius: 10,
  },
  modalTitle: {
    textAlign: 'center',
    fontSize: 24,
    marginVertical: 10,
    color: '#333'
  },
  modalDescription: {
    textAlign: 'center',
    marginVertical: 5,
    color: '#757575',
  },
  modalSubtitle: {
    textAlign: 'center',
    fontSize: 18,
    marginTop: 15,
    color: '#666'
  },
  closeButton: {
    marginTop: 20,
  },
});

export default MoviesByGenre;
