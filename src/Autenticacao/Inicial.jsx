import React from "react";
import { View, Image, StyleSheet } from "react-native";
import { Button, Text, PaperProvider, Divider } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";

const Initial = () => {
  const navigation = useNavigation();

  return (
    <PaperProvider>
      <View style={styles.container}>
        <Text style={styles.title}><Text style={{color:'#0000CD', fontWeight:'bold'}}>TMDB</Text>.Filmes</Text>
        <Image
          source={{
            uri: 'https://s3-sa-east-1.amazonaws.com/projetos-artes/fullsize%2F2016%2F11%2F30%2F19%2FLogo-199302_128726_193614258_453669003.jpg',
          }}
          style={styles.image}
        />
        <Text style={styles.subtitle}>O melhor app de filmes!</Text>

        <Button
          style={styles.button}
          onPress={() => navigation.navigate('Login')}
          mode="contained"
          contentStyle={styles.buttonContent}
        >
          Login
        </Button>
        <Button
          style={styles.button}
          onPress={() => navigation.navigate('Registro')}
          mode="contained"
          contentStyle={styles.buttonContent}
        >
          Registro
        </Button>

        <Divider style={styles.divider} />

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2024 TMDB Filmes</Text>
          <Text style={styles.footerText}>Todos os direitos reservados</Text>
        </View>
      </View>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    color: '#333',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  image: {
    height: 150,
    width: '80%',
    borderRadius: 8,
    marginTop: 15,
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 20,
    color: '#666',
    marginBottom: 20,
  },
  button: {
    width: '90%',
    marginVertical: 10,
    borderRadius: 25,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  divider: {
    marginTop: 20,
    width: '90%',
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#999',
  },
});

export default Initial;
