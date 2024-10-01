import React, { useEffect, useState } from 'react';
import { FlatList, View, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { Card, Title, IconButton } from 'react-native-paper';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '../services/firebaseConfig'; // Certifique-se de que o caminho está correto
import { useIsFocused } from '@react-navigation/native';

// Função para adicionar filme à lista do Firestore
export const addToUserList = async (movie) => {
    try {
      const user = auth.currentUser; // Usuário autenticado
      if (user) {
        const docRef = await addDoc(collection(db, 'userMovieList'), {
          userId: user.uid,
          movieId: movie.id,
          title: movie.title,
          poster: movie.poster_path,
          releaseDate: movie.release_date,
          overview: movie.overview,
        });
        console.log('Filme adicionado à lista do usuário!', docRef.id);
        return { id: docRef.id, ...movie }; // Retorna o filme adicionado com o ID gerado
      }
    } catch (error) {
      console.error('Erro ao adicionar filme à lista:', error);
      return null;
    }
};

// Função para remover filme da lista do Firestore
const removeFromUserList = async (movieId) => {
  try {
    const user = auth.currentUser;
    if (user) {
      const movieDocRef = doc(db, 'userMovieList', movieId);
      await deleteDoc(movieDocRef);
      console.log('Filme removido com sucesso!');
    }
  } catch (error) {
    console.error('Erro ao remover o filme:', error);
  }
};

// Tela SuaLista
const SuaLista = () => {
  const [userMovies, setUserMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused(); // Verifica se a tela está ativa

  useEffect(() => {
    const fetchUserMovies = async () => {
      setLoading(true);
      try {
        const user = auth.currentUser;
        if (user) {
          const q = query(collection(db, 'userMovieList'), where('userId', '==', user.uid));
          const querySnapshot = await getDocs(q);
          const moviesList = [];
          querySnapshot.forEach((doc) => {
            moviesList.push({ id: doc.id, ...doc.data() });
          });
          setUserMovies(moviesList);
        }
      } catch (error) {
        console.error('Erro ao buscar filmes:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isFocused) {
      fetchUserMovies(); // Buscar filmes sempre que a tela estiver em foco
    }
  }, [isFocused]);

  // Função para remover o filme da lista e atualizar o estado
  const handleRemoveMovie = async (movieId) => {
    await removeFromUserList(movieId);
    setUserMovies((prevMovies) => prevMovies.filter((movie) => movie.id !== movieId));
  };

  return (
    <View style={styles.container}>
      <Title style={{color:"#333", textAlign:'center', marginBottomBottom:10,fontSize:25, fontWeight:'bold',fontStyle:'italic'}}>
        Sua Lista
        </Title>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={userMovies}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <View style={styles.movieRow}>
                {/* Imagem do filme */}
                <Image
                  source={{ uri: `https://image.tmdb.org/t/p/w500${item.poster}` }}
                  style={styles.movieImage}
                />
                <View style={styles.movieDetails}>
                  <Title>{item.title}</Title>
                  <Text>{item.releaseDate}</Text>
                </View>
                {/* Botão de deletar */}
                <IconButton
                  icon="delete"
                  onPress={() => handleRemoveMovie(item.id)}
                />
              </View>
            </Card>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 10,
  },
  card: {
    marginBottom: 10,
    borderRadius: 10,
  },
  movieRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  movieImage: {
    width: 100,
    height: 150,
    borderRadius: 8,
  },
  movieDetails: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center',
  },
});

export default SuaLista;
