import React, { useState, useEffect } from 'react';
import { FlatList, View, StyleSheet, ImageBackground } from 'react-native';
import { Card, Searchbar, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

const API_KEY = 'b6b3738a3883cb0b8ad12e7ab27079f7';
const CATEGORIES_URL = `https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}`;

const MovieCategories = () => {
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [backgroundImages, setBackgroundImages] = useState({});
  const navigation = useNavigation();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(CATEGORIES_URL);
        const data = await response.json();
        setCategories(data.genres);
        setFilteredCategories(data.genres);

        // Fetch random background images for each category
        const backgroundImages = await Promise.all(data.genres.map(async (category) => {
          const moviesResponse = await fetch(
            `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=${category.id}`
          );
          const moviesData = await moviesResponse.json();
          const randomMovie = moviesData.results[Math.floor(Math.random() * moviesData.results.length)];
          return {
            id: category.id,
            image: `https://image.tmdb.org/t/p/w500${randomMovie.poster_path}`
          };
        }));
        setBackgroundImages(Object.fromEntries(backgroundImages.map(img => [img.id, img.image])));
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const onChangeSearch = (query) => {
    setSearchQuery(query);
    if (query) {
      const filtered = categories.filter((category) =>
        category.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories(categories);
    }
  };

  const renderItem = ({ item: category }) => (
    <Card
      key={category.id}
      style={styles.card}
      onPress={() => navigation.navigate('Movies',  { genreId: category.id, genreName: category.name })}
      >
    
      <ImageBackground
        source={{ uri: backgroundImages[category.id] || 'https://via.placeholder.com/300x200' }}
        style={styles.background}
        resizeMode="cover"
      >
        <Card.Content style={styles.cardContent}>
          <Text style={styles.categoryName}>{category.name}</Text>
        </Card.Content>
      </ImageBackground>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Pesquisar genêros"
        onChangeText={onChangeSearch}
        value={searchQuery}
        style={styles.searchbar}
      />
      <FlatList
        data={filteredCategories}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.categoryList}
      />
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
    marginBottom: 15,
    borderRadius: 8,
  },
  categoryList: {
    paddingBottom: 20,
  },
  card: {
    marginBottom: 15,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 4, // Sombra do card
  },
  background: {
    height: 150,
    justifyContent: 'center',
  },
  cardContent: {
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparente para destacar o texto
  },
  categoryName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff', // Texto branco para contraste com o fundo
  },
});

export default MovieCategories;
