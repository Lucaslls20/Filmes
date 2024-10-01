import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, Modal, StyleSheet, Dimensions } from 'react-native';
import { Button, Card, Title, Portal, Provider } from 'react-native-paper';
import YoutubeIframe from 'react-native-youtube-iframe';
import {WebView} from 'react-native-webview'
import { useRoute } from '@react-navigation/native';

const Trailer = () => {
  const route = useRoute();
  const { movieId } = route.params;
  const [trailerKey, setTrailerKey] = useState(null);
  const [loading, setLoading] = useState(false);
  const [visibleModal, setVisibleModal] = useState(false);

  const fetchTrailer = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=b6b3738a3883cb0b8ad12e7ab27079f7`
      );
      const data = await response.json();

      if (data && data.results && data.results.length > 0) {
        const trailer = data.results.find(
          (video) => video.type === 'Trailer' && video.site === 'YouTube'
        );

        if (trailer) {
          console.log('Trailer Key:', trailer.key); // Verifique o trailerKey
          setTrailerKey(trailer.key);
        } else {
          alert('Trailer não disponível.');
        }
      } else {
        alert('Nenhum vídeo encontrado para este filme.');
      }
    } catch (error) {
      console.error('Erro ao buscar trailer:', error);
      alert('Ocorreu um erro ao buscar o trailer. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (movieId) {
      fetchTrailer();
    }
  }, [movieId]);

  const handleWatchTrailer = () => {
    setVisibleModal(true); // Exibe o modal
  };

  const handleCloseModal = () => {
    setVisibleModal(false); // Fecha o modal
  };

  return (
   
        <Provider>
          <View style={styles.container}>
            <Card>
              <Card.Content>
                <Title>Trailer do Filme</Title>
                {loading ? (
                  <ActivityIndicator size="large" />
                ) : (
                  trailerKey && (
                    <Button mode="contained" onPress={handleWatchTrailer}>
                      Assistir Trailer
                    </Button>
                  )
                )}
              </Card.Content>
            </Card>
    
            {/* Modal de tela cheia */}
            <Portal>
              <Modal visible={visibleModal} onRequestClose={handleCloseModal} animationType="slide">
                <View style={styles.modalContent}>
                  {trailerKey ? (
                    <WebView
                      source={{ uri: `https://www.youtube.com/watch?v=${trailerKey}` }}
                      style={{ flex: 1, height: Dimensions.get('window').height }}
                    />
                  ) : (
                    <ActivityIndicator size="large" />
                  )}
                  <Button mode="contained" onPress={handleCloseModal} style={styles.closeButton}>
                    Fechar
                  </Button>
                </View>
              </Modal>
            </Portal>
          </View>
        </Provider>
      );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
    modalContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent', // Altere para transparente
  },
  closeButton: {
    marginTop: 20,
    width: '80%',
    marginBottom:20
  },
});

export default Trailer;
