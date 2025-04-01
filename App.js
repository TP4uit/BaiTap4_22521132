import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import screens - đường dẫn đúng và tên file chính xác
import LoginScreen from './screens/LoginScreen';
import ToDoListScreen from './screens/ToDoListScreen';
import ToDoDetail from './screens/ToDoDetail';

const Stack = createStackNavigator();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);

  // Check if user is already logged in
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');
        setUserToken(isLoggedIn);
      } catch (error) {
        console.log('Error checking login status:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkLoginStatus();
  }, []);

  if (isLoading) {
    // You could show a splash screen here
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {userToken ? (
          // User is logged in
          <>
            <Stack.Screen name="TodoList" component={ToDoListScreen} />
            <Stack.Screen name="TodoDetail" component={ToDoDetail} />
            <Stack.Screen name="Login" component={LoginScreen} />
          </>
        ) : (
          // User is not logged in
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="TodoList" component={ToDoListScreen} />
            <Stack.Screen name="TodoDetail" component={ToDoDetail} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;