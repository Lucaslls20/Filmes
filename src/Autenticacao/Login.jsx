import React, { useState } from "react";
import { auth } from "../services/firebaseConfig";
import { Button, Text, TextInput, Snackbar, Divider } from "react-native-paper";
import { SafeAreaView, StyleSheet, Image, View, Pressable } from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";

const Login = ({handleAuthentication}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const navigation = useNavigation();

  const validateFields = () => {
    if (!email || !password) {
      setSnackbarMessage('Por favor, preencha todos os campos');
      setSnackbarVisible(true);
      return false;
    }
    return true;
  };

  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (validateFields()) {
      setLoading(true);
      try {
        await signInWithEmailAndPassword(auth, email, password);
        handleAuthentication(true); // Adicione esta linha
        navigation.navigate('Categorias'); // Navegar após autenticação
      } catch (error) {
        setSnackbarMessage('Erro ao fazer login');
        setSnackbarVisible(true);
      } finally {
        setLoading(false);
      }
    }
  };
  



  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}><Text style={{color:'#0000CD', fontWeight:'bold'}}>TMDB</Text>.Filmes</Text>
        <Image
          source={{
            uri: 'https://s3-sa-east-1.amazonaws.com/projetos-artes/fullsize%2F2016%2F11%2F30%2F19%2FLogo-199302_128726_193614258_453669003.jpg',
          }}
          style={styles.image}
        />
      </View>

      <Text style={styles.loginText}>Login</Text>

      <View style={styles.inputContainer}>
        <TextInput
          value={email}
          label="Email"
          onChangeText={setEmail}
          mode="flat"
          style={styles.input}
          keyboardType="email-address"
          textColor="#777"
        />
        <TextInput
          value={password}
          label="Password"
          onChangeText={setPassword}
          mode="flat"
          secureTextEntry
          style={styles.input}
          textColor="#777"

        />

        <Button
          mode="contained"
          onPress={handleLogin}
          loading={loading}
          disabled={loading}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#FFF' }}>Login</Text>
        </Button>

        <Pressable onPress={() => navigation.navigate('Registro')}>
          <Text style={styles.registerText}>
            Não tem conta? Faça seu registro agora!
          </Text>
        </Pressable>
      </View>

      <Divider style={styles.divider} />

      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2024 TMDB Filmes</Text>
        <Text style={styles.footerText}>Todos os direitos reservados</Text>
      </View>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={Snackbar.DURATION_SHORT}
        style={styles.snackbar}
      >
        {snackbarMessage}
      </Snackbar>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 30,
    color: '#333', // Azul para se destacar
    fontWeight: 'bold',
  },
  image: {
    height: 120,
    width: '80%',
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 20,
  },
  loginText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    width: '100%',
  },
  input: {
    marginBottom: 15,
    backgroundColor: '#FFF',
    borderRadius: 10, // Deixa os campos de texto mais amigáveis
  },
  button: {
    marginTop: 10,
    marginBottom: 15,
    borderRadius: 25,
    backgroundColor: '#1E90FF', // Cores mais vibrantes para os botões
  },
  buttonContent: {
    paddingVertical: 10,
  },
  registerText: {
    color: '#1E90FF', // Melhorar a visibilidade do texto com azul
    textAlign: 'center',
    marginTop: 10,
    fontSize: 16, // Aumentar o tamanho para melhor legibilidade
  },
  divider: {
    marginTop: 20,
    width: '100%',
    height: 1,
    backgroundColor: '#CCC',
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#999',
  },
  snackbar: {
    backgroundColor: '#FF5252',
  },
});


export default Login;
