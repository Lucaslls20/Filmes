import React, { useEffect, useState } from "react";
import { View, FlatList, Text, Image, StyleSheet, Alert, ActivityIndicator, Modal, SafeAreaView } from "react-native";
import { Searchbar, Card, Title, Paragraph, Menu, IconButton, Button } from "react-native-paper";
import { addToUserList } from './SuaLista';

const API_KEY = 'b6b3738a3883cb0b8ad12e7ab27079f7';

const Search = () => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(false); // Muda para false para evitar loading constante
    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [totalPages, setTotalPages] = useState(1);
    const [visibleMenu, setVisibleMenu] = useState(null);
    const [visibleModal, setVisibleModal] = useState(false);
    const [movieDetails, setMovieDetails] = useState(null);
    const [cast, setCast] = useState([]);
    const [moviesDuration, setMoviesDuration] = useState({})

    const fetchMovieDuration = async (movieId) => {
        try {
            const response = await fetch(
                `https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}`
            );
            const data = await response.json();
            setMoviesDuration(prevState => ({
                ...prevState,
                [movieId]: data.runtime // Salva a duração no estado usando o ID do filme como chave
            }));
        } catch (error) {
            console.log("Erro ao buscar duração do filme", error.message);
        }
    };
    
    // Função única para buscar filmes e suas durações
    const fetchMovies = async (pageNum = 1, query = '') => {
        if (loading || pageNum > totalPages) return; // Previne múltiplas requisições ou ultrapassar o total de páginas
        setLoading(true);
        try {
            const url = query
                ? `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${query}&page=${pageNum}`
                : `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&page=${pageNum}`;
    
            const response = await fetch(url);
            const data = await response.json();
    
            if (data.results) {
                const moviesWithDuration = await Promise.all(
                    data.results.map(async (movie) => {
                        await fetchMovieDuration(movie.id); // Busca a duração de cada filme
                        return movie;
                    })
                );
    
                setMovies(prevMovies => [...prevMovies, ...moviesWithDuration]); // Adiciona os novos resultados à lista existente
                setTotalPages(data.total_pages); // Atualiza o total de páginas
            } else {
                Alert.alert("Nenhum resultado encontrado.");
            }
        } catch (err) {
            Alert.alert("Algo deu errado", err.message);
        } finally {
            setLoading(false);
        }
    };

    const closeMenu = () => setVisibleMenu(null);
    const openMenu = (id) => setVisibleMenu(id);

    const onChangeSearch = (query) => {
        setSearchQuery(query);
        setMovies([]);
        setPage(1);
        fetchMovies(1, query); // Reinicia a busca com a nova query
    };

    useEffect(() => {
        fetchMovies(page); // Busca os filmes na página atual
    }, [page]);

    const fetchCast = async (movieId) => {
        try {
            const response = await fetch(
                `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${API_KEY}`
            );
            const data = await response.json();
            setCast(data.cast.slice(0, 5)); // Limita o número de atores exibidos
        } catch (error) {
            Alert.alert("Erro ao buscar elenco do filme", error.message);
        }
    };

    const openModal = async (movieId) => {
        setLoading(true);
        try {
            const response = await fetch(
                `https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}`
            );
            const data = await response.json();
            setMovieDetails(data);
            await fetchCast(movieId);
            setVisibleModal(true);
        } catch (error) {
            Alert.alert("Erro ao buscar detalhes do filme", error.message);
        } finally {
            setLoading(false);
        }
    };

    const closeModal = () => {
        setVisibleModal(false);
        setMovieDetails(null);
        setCast([]);
    };

    const renderMovieItem = ({ item, index }) => (
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
                <Paragraph>Duração: {moviesDuration[item.id] ? `${moviesDuration[item.id]} minutos` : 'Duração não disponível'}</Paragraph>
                <Paragraph>Nota: {item.vote_average ? `${item.vote_average.toFixed(1)}` : 'Nota não disponível'}</Paragraph>

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
                  addToUserList(item);
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
                placeholder="Pesquisar filmes"
                onChangeText={onChangeSearch}
                value={searchQuery}
                style={styles.searchbar}
            />

            {loading && page === 1 ? ( // Mostra o indicador apenas no primeiro carregamento
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <FlatList
                data={movies}
                keyExtractor={(item, index) => `${item.id}-${index}`} // Garante chaves únicas
                renderItem={renderMovieItem}
                onEndReached={() => setPage(prevPage => prevPage + 1)}
                onEndReachedThreshold={0.5}
                ListFooterComponent={loading && page > 1 ? <ActivityIndicator size="large" color="#0000ff" /> : null}
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
                                    <Text style={styles.modalDescription}>Lançamento: {movieDetails.release_date}</Text>
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
    card: {
        marginBottom: 10,
        borderRadius: 10,
        elevation: 4,
    },
    cardRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardContent: {
        flex: 1,
    },
    poster: {
        width: 100,
        height: 150,
        borderRadius: 8,
        marginRight: 10,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
    modalContent: {
        margin: 20,
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
    },
    modalPoster: {
        width: 200,
        height: 300,
        borderRadius: 10,
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    modalDescription: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 10,
    },
    modalSubtitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    closeButton: {
        marginTop: 20,
    },
});

export default Search;
