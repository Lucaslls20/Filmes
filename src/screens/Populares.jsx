import React, { useState, useEffect } from 'react';
import { View, FlatList, Image, StyleSheet, Modal, ActivityIndicator, SafeAreaView } from 'react-native';
import { Searchbar, Card, Title, Paragraph, Menu, IconButton, Button, Text } from 'react-native-paper';
import axios from 'axios';
import { addToUserList } from './SuaLista';
import { useNavigation } from '@react-navigation/native';

const API_KEY = 'b6b3738a3883cb0b8ad12e7ab27079f7'; // Sua chave de API
const BASE_URL = 'https://api.themoviedb.org/3';

const Popular = ({ route }) => {
  const [movies, setMovies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleMenu, setVisibleMenu] = useState(null);
  const [visibleModal, setVisibleModal] = useState(false);
  const [movieDetails, setMovieDetails] = useState(null);
  const [cast, setCast] = useState([]);
  const navigation = useNavigation();

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/movie/popular`, {
        params: { api_key: API_KEY },
      });

      // Buscando detalhes de cada filme
      const moviesWithRuntime = await Promise.all(response.data.results.map(async (movie) => {
        const detailsResponse = await axios.get(`${BASE_URL}/movie/${movie.id}`, {
          params: { api_key: API_KEY },
        });
        return { ...movie, runtime: detailsResponse.data.runtime };
      }));

      setMovies(moviesWithRuntime);
      setFilteredMovies(moviesWithRuntime);
    } catch (error) {
      console.error('Erro ao buscar filmes populares:', error);
    } finally {
      setLoading(false);
    }
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

  useEffect(() => {
    fetchMovies();
  }, []);

  const onChangeSearch = (query) => {
    setSearchQuery(query);
    if (query) {
      const filteredData = movies.filter((movie) =>
        movie.title.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredMovies(filteredData);
    } else {
      setFilteredMovies(movies);
    }
  };

  const openMenu = (movieId) => setVisibleMenu(movieId);
  const closeMenu = () => setVisibleMenu(null);

  const openModal = async (movieId) => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/movie/${movieId}`, {
        params: { api_key: API_KEY },
      });
      setMovieDetails(response.data);

      const creditsResponse = await axios.get(`${BASE_URL}/movie/${movieId}/credits`, {
        params: { api_key: API_KEY },
      });
      setCast(creditsResponse.data.cast.slice(0, 5));
      setVisibleModal(true);
    } catch (error) {
      console.error('Erro ao buscar detalhes do filme:', error);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setVisibleModal(false);
    setMovieDetails(null);
    setCast([]);
  };

  const renderMovieItem = ({ item }) => (
    <Card style={styles.card}>
      <View style={styles.cardRow}>
        <Image
          source={{ uri: `https://image.tmdb.org/t/p/w500${item.poster_path}` }}
          style={styles.poster}
        />
        <View style={styles.cardContent}>
          <Card.Content>
            <Title>{item.title}</Title>
            <Paragraph>Lançamento: {item.release_date}</Paragraph>
            <Paragraph>Duração: {item.runtime ? `${item.runtime} minutos` : 'Duração não disponível'}</Paragraph>
            <Text style={{fontStyle:'italic'}} >Nota: <Text style={{color:'#F8E5B7'}}>{item.vote_average.toFixed(1)}</Text></Text>
<Text style={{fontStyle:'italic'}}>Número de Votos: {item.vote_count}</Text>

          </Card.Content>
        </View>
        <Menu
          visible={visibleMenu === item.id}
          onDismiss={closeMenu}
          anchor={
            <IconButton
              icon="dots-vertical"
              size={24}
              onPress={() => openMenu(item.id)}
            />
          }
        >
          <Menu.Item
            onPress={() => {
              closeMenu();
              openModal(item.id);
            }}
            leadingIcon="information-outline"
            title="Ver Detalhes"
          />
          <Menu.Item
            onPress={() => {
              closeMenu();
              addToQueue(item);
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
  );

  return (
    <View style={styles.container}>
 
      <Searchbar
        placeholder="Pesquisar os populares"
        onChangeText={onChangeSearch}
        value={searchQuery}
        style={styles.searchbar}
      />

     <Text style={{color:'#333', textAlign:'center', fontSize:22, margin:10,marginBottom:10}}>Populares do <Text style={{color:'#0000CD', fontWeight:'bold'}}>TMDB</Text>.Filmes</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loadingIndicator} />
      ) : (
        <FlatList
          data={filteredMovies}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderMovieItem}
          contentContainerStyle={styles.list}
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
              movieDetails && (
                <>
                  <Image
                    source={{ uri: `https://image.tmdb.org/t/p/w500${movieDetails.poster_path}` }}
                    style={styles.modalPoster}
                  />
                  <Title style={styles.modalTitle}>{movieDetails.title}</Title>
                  <Text style={styles.modalDescription}>{movieDetails.release_date}</Text>
                  <Text style={styles.modalDescription}>{movieDetails.overview}</Text>
                  <Title style={styles.modalSubtitle}>Atores</Title>
                  {cast.map((actor) => (
                    <Text key={actor.id} style={styles.modalDescription}>
                      {actor.name} como {actor.character}
                    </Text>
                  ))}
                  <Button mode="contained" onPress={closeModal} style={styles.closeButton}>
                    Fechar
                  </Button>
                </>
              )
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
    padding: 10,
  },
  searchbar: {
    marginBottom: 10,
  },
  list: {
    paddingBottom: 20,
  },
  loadingIndicator: {
    marginTop: 20,
  },
  card: {
    marginBottom: 10,
    borderRadius: 10,
    elevation: 4, // Sombra leve
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  poster: {
    width: 100,
    height: 150,
    borderRadius: 5,
  },
  cardContent: {
    flex: 1,
    marginLeft: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 600,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalPoster: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    marginBottom: 20,
  },
  modalTitle: {
    fontWeight: 'bold',
    fontSize: 24,
    textAlign: 'center',
  },
  modalDescription: {
    marginVertical: 10,
    textAlign: 'center',
    color: '#555',
  },
  modalSubtitle: {
    marginTop: 10,
    color: '#344',
    fontStyle: 'italic',
    fontSize: 18,
  },
  closeButton: {
    marginTop: 20,
    width: '100%',
  },
});

export default Popular;
