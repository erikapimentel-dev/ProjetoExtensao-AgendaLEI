// App.js
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { LogBox } from 'react-native';
import { getCurrentTeacher } from './src/utils/asyncStorage';
import colors from './src/config/colors';
import AppNavigator from './src/navigation/AppNavigator';
import LoadingIndicator from './src/components/LoadingIndicator';

// Ignorar avisos específicos (opcional, apenas para desenvolvimento)
LogBox.ignoreLogs([
  'Setting a timer',
  'AsyncStorage has been extracted',
]);

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState('TeacherRegister');

  useEffect(() => {
    // Verificar se já existe um professor cadastrado
    const checkTeacher = async () => {
      try {
        const teacher = await getCurrentTeacher();
        if (teacher) {
          setInitialRoute('MainApp');
        }
      } catch (error) {
        console.log('Error checking teacher:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkTeacher();
  }, []);

  if (isLoading) {
    return <LoadingIndicator />;
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" backgroundColor={colors.primary} />
      <AppNavigator initialRoute={initialRoute} />
    </NavigationContainer>
  );
}
