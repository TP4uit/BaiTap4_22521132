import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Default credentials
const DEFAULT_CREDENTIALS = {
  username: 'admin',
  password: 'password123'
};

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetUsername, setResetUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savedCredentials, setSavedCredentials] = useState(DEFAULT_CREDENTIALS);

  // Load saved credentials if any
  useEffect(() => {
    const loadCredentials = async () => {
      try {
        const savedUsername = await AsyncStorage.getItem('savedUsername');
        const savedPassword = await AsyncStorage.getItem('savedPassword');
        
        if (savedUsername && savedPassword) {
          setSavedCredentials({
            username: savedUsername,
            password: savedPassword
          });
        }
      } catch (error) {
        console.log('Error loading credentials:', error);
      }
    };
    
    loadCredentials();
  }, []);

  const handleLogin = async () => {
    // Check if username and password match the valid credentials
    if (
      username === savedCredentials.username && 
      password === savedCredentials.password
    ) {
      // Clear any previous error messages
      setErrorMessage('');
      
      // Save logged in status
      try {
        await AsyncStorage.setItem('isLoggedIn', 'true');
        await AsyncStorage.setItem('userId', '12345');
        await AsyncStorage.setItem('userName', 'Admin User');
      } catch (error) {
        console.log('Error saving login status:', error);
      }
      
      // Navigate to to-do list screen with user data
      navigation.navigate('TodoList', {
        userId: '12345',
        userName: 'Admin User'
      });
    } else {
      // Set error message
      setErrorMessage('Incorrect username or password');
    }
  };

  const handleForgotPassword = () => {
    setIsResetMode(true);
    setResetUsername('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleResetPassword = async () => {
    // Validate inputs
    if (resetUsername.trim() === '') {
      Alert.alert('Error', 'Please enter your username');
      return;
    }
    
    if (resetUsername !== savedCredentials.username) {
      Alert.alert('Error', 'Username not found');
      return;
    }
    
    if (newPassword.trim() === '') {
      Alert.alert('Error', 'Please enter a new password');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    // Save new password
    try {
      await AsyncStorage.setItem('savedUsername', resetUsername);
      await AsyncStorage.setItem('savedPassword', newPassword);
      
      // Update in-memory credentials
      setSavedCredentials({
        username: resetUsername,
        password: newPassword
      });
      
      Alert.alert(
        'Success',
        'Password has been reset successfully.',
        [
          {
            text: 'OK',
            onPress: () => {
              setIsResetMode(false);
              setResetUsername('');
              setNewPassword('');
              setConfirmPassword('');
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error saving new password:', error);
      Alert.alert('Error', 'Failed to reset password');
    }
  };

  const handleCancel = () => {
    setIsResetMode(false);
    setResetUsername('');
    setNewPassword('');
    setConfirmPassword('');
  };

  // Render forgot password form
  if (isResetMode) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.contentContainer}>
          <View style={styles.formContainer}>
            <Text style={styles.title}>Reset Password</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your username"
                placeholderTextColor="#999"
                value={resetUsername}
                onChangeText={setResetUsername}
                autoCapitalize="none"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>New Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter new password"
                placeholderTextColor="#999"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Confirm new password"
                placeholderTextColor="#999"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>
            
            <TouchableOpacity 
              style={styles.button}
              onPress={handleResetPassword}
            >
              <Text style={styles.buttonText}>Reset Password</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Render normal login form
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Login</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter username"
              placeholderTextColor="#999"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              placeholder="Enter password"
              placeholderTextColor="#999"
            />
          </View>
          
          {errorMessage ? (
            <Text style={styles.errorMessage}>{errorMessage}</Text>
          ) : null}
          
          <TouchableOpacity 
            style={styles.button}
            onPress={handleLogin}
          >
            <Text style={styles.buttonText}>Confirm and Continue</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.forgotPasswordContainer}
            onPress={handleForgotPassword}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  contentContainer: {
    flex: 1,
    marginHorizontal: 5,
    justifyContent: 'flex-start',
    paddingTop: '40%',
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 23,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'System',
  },
  inputGroup: {
    marginBottom: 10,
    width: '100%',
  },
  label: {
    fontSize: 16,
    marginTop: 10,
    marginBottom: 10,
    fontFamily: 'System',
  },
  input: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    width: '100%',
  },
  button: {
    backgroundColor: '#222',
    borderRadius: 10,
    padding: 15,
    marginTop: 30,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'System',
  },
  errorMessage: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  },
  forgotPasswordContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: '#0066cc',
    fontSize: 16,
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 15,
    marginTop: 15,
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'System',
  },
});

export default LoginScreen;