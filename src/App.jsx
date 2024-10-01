import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import { PaperProvider } from "react-native-paper";
import MovieCategories from "./screens/Categories";
import MoviesByGenre from "./screens/FilmesbyCategorias";
import SuaLista from "./screens/SuaLista";
import Initial from "./Autenticacao/Inicial";
import Login from "./Autenticacao/Login";
import Registro from "./Autenticacao/Registro";
import Popular from "./screens/Populares";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Search from "./screens/Search";

const AuthStack = createStackNavigator();
const Tab = createMaterialBottomTabNavigator();
const CategoriesStack = createStackNavigator();

const CategoriesNavigator = () => {
  return (
    <CategoriesStack.Navigator initialRouteName="Categorias">
      <CategoriesStack.Screen
        name="Categorias"
        component={MovieCategories}
        options={{ headerShown: false }}
      />
      <CategoriesStack.Screen
        name="Movies"
        component={MoviesByGenre}
        options={{ headerShown: false }}
      />
    </CategoriesStack.Navigator>
  );
};

const AuthNavigator = ({ handleAuthentication }) => {
  return (
    <AuthStack.Navigator initialRouteName="Initial">
      <AuthStack.Screen name="Initial" component={Initial} options={{ headerShown: false }} />
      <AuthStack.Screen name="Login">
        {props => <Login {...props} handleAuthentication={handleAuthentication} />}
      </AuthStack.Screen>
      <AuthStack.Screen name="Registro">
        {props => <Registro {...props} handleAuthentication={handleAuthentication} />}
      </AuthStack.Screen>
    </AuthStack.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <Tab.Navigator
      activeColor="#f0edf6"
      inactiveColor="#3e2465"
      barStyle={{ backgroundColor: '#f5f5f5' }}
    >
      <Tab.Screen
        name="CategoriasTab"
        component={CategoriesNavigator} // Navegador de categorias
        options={{
          tabBarLabel: 'Categorias',
          tabBarIcon: ({ color }) => (
            <Icon name="filmstrip" color={color} size={24} />
          ),
        }}
      />
      <Tab.Screen
        name="Pesquisar"
        component={Search} // Navegador de categorias
        options={{
          tabBarLabel: 'Pesquisar',
          tabBarIcon: ({ color }) => (
            <Icon name="magnify" color={color} size={24} />
          ),
        }}
      />
      <Tab.Screen
        name="Populares"
        component={Popular}
        options={{
          tabBarLabel: 'Populares',
          tabBarIcon: ({ color }) => (
            <Icon name="star" color={color} size={24} />
          ),
        }}
      />
      <Tab.Screen
        name="SuaLista"
        component={SuaLista}
        options={{
          tabBarLabel: 'Sua lista',
          tabBarIcon: ({ color }) => (
            <Icon name="playlist-check" color={color} size={24} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  const handleAuthentication = (isAuthenticated) => {
    setIsAuthenticated(isAuthenticated);
  };

  return (
    <PaperProvider>
      <NavigationContainer>
        {isAuthenticated ? (
          <AppNavigator />
        ) : (
          <AuthNavigator handleAuthentication={handleAuthentication} />
        )}
      </NavigationContainer>
    </PaperProvider>
  );
};

export default App;
