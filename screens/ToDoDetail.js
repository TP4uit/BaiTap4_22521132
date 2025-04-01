import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TodoDetailScreen = ({ navigation, route }) => {
  const { todoId } = route.params;
  
  const [todo, setTodo] = useState(null);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTodoDetails();
  }, [todoId]);

  const loadTodoDetails = async () => {
    try {
      const todosJson = await AsyncStorage.getItem('todos');
      if (todosJson) {
        const todos = JSON.parse(todosJson);
        const foundTodo = todos.find(item => item.id === todoId);
        
        if (foundTodo) {
          setTodo(foundTodo);
          setTitle(foundTodo.title);
          setNotes(foundTodo.notes || '');
          setIsCompleted(foundTodo.completed);
        } else {
          Alert.alert('Error', 'Todo not found');
          navigation.goBack();
        }
      }
    } catch (error) {
      console.error('Error loading todo details:', error);
      Alert.alert('Error', 'Failed to load todo details');
    } finally {
      setLoading(false);
    }
  };

  const saveTodoChanges = async () => {
    if (title.trim() === '') {
      Alert.alert('Error', 'Title cannot be empty');
      return;
    }

    try {
      const todosJson = await AsyncStorage.getItem('todos');
      if (todosJson) {
        const todos = JSON.parse(todosJson);
        const updatedTodos = todos.map(item => {
          if (item.id === todoId) {
            return {
              ...item,
              title,
              notes,
              completed: isCompleted,
              updatedAt: new Date().toISOString()
            };
          }
          return item;
        });
        
        await AsyncStorage.setItem('todos', JSON.stringify(updatedTodos));
        Alert.alert('Success', 'Todo updated successfully', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      console.error('Error saving todo changes:', error);
      Alert.alert('Error', 'Failed to save changes');
    }
  };

  const toggleCompletion = () => {
    setIsCompleted(!isCompleted);
  };

  const confirmDelete = () => {
    Alert.alert(
      'Delete Todo',
      'Are you sure you want to delete this todo?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: deleteTodo }
      ]
    );
  };

  const deleteTodo = async () => {
    try {
      const todosJson = await AsyncStorage.getItem('todos');
      if (todosJson) {
        const todos = JSON.parse(todosJson);
        const updatedTodos = todos.filter(item => item.id !== todoId);
        
        await AsyncStorage.setItem('todos', JSON.stringify(updatedTodos));
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error deleting todo:', error);
      Alert.alert('Error', 'Failed to delete todo');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Task Details</Text>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Title</Text>
              <TextInput
                style={styles.titleInput}
                value={title}
                onChangeText={setTitle}
                placeholder="Task title"
              />
            </View>

            <View style={styles.completionContainer}>
              <Text style={styles.label}>Status</Text>
              <TouchableOpacity 
                style={styles.statusButton} 
                onPress={toggleCompletion}
              >
                <View style={[styles.checkbox, isCompleted && styles.checkedBox]}>
                  {isCompleted && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.statusText}>
                  {isCompleted ? 'Completed' : 'Not Completed'}
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Notes</Text>
              <TextInput
                style={styles.notesInput}
                value={notes}
                onChangeText={setNotes}
                placeholder="Add notes here..."
                multiline
                textAlignVertical="top"
              />
            </View>
            
            <View style={styles.createdAtContainer}>
              <Text style={styles.label}>Created</Text>
              <Text style={styles.dateText}>
                {new Date(todo?.createdAt).toLocaleString()}
              </Text>
              
              {todo?.updatedAt && (
                <>
                  <Text style={styles.label}>Last Updated</Text>
                  <Text style={styles.dateText}>
                    {new Date(todo.updatedAt).toLocaleString()}
                  </Text>
                </>
              )}
            </View>
          </View>
        </ScrollView>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={confirmDelete}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={saveTodoChanges}
          >
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#222',
    padding: 15,
    paddingTop: 45,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  backButton: {
    position: 'absolute',
    left: 15,
    top: 45,
    padding: 5,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
  },
  formContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
    color: '#555',
  },
  titleInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    backgroundColor: 'white',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    minHeight: 150,
    backgroundColor: 'white',
  },
  completionContainer: {
    marginBottom: 20,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkedBox: {
    backgroundColor: '#222',
  },
  checkmark: {
    color: 'white',
    fontSize: 16,
  },
  statusText: {
    fontSize: 16,
  },
  createdAtContainer: {
    marginTop: 10,
  },
  dateText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: 'white',
  },
  saveButton: {
    flex: 3,
    backgroundColor: '#222',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#ff3b30',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginRight: 10,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TodoDetailScreen;