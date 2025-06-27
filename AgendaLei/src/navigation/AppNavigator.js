// src/navigation/AppNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import CalendarScreen from '../screens/CalendarScreen';
import BookingFormScreen from '../screens/BookingFormScreen';
import MyBookingsScreen from '../screens/MyBookingsScreen';
import TeacherRegisterScreen from '../screens/TeacherRegisterScreen';

import colors from '../config/colors';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack Navigator para a tela inicial e formulário de agendamento
const HomeStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="HomeMain" component={HomeScreen} />
    <Stack.Screen name="BookingForm" component={BookingFormScreen} />
  </Stack.Navigator>
);

// Stack Navigator para a tela de calendário e formulário de agendamento
const CalendarStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="CalendarMain" component={CalendarScreen} />
    <Stack.Screen name="BookingForm" component={BookingFormScreen} />
  </Stack.Navigator>
);

// Stack Navigator para a tela de meus agendamentos e formulário de agendamento
const MyBookingsStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="MyBookingsMain" component={MyBookingsScreen} />
    <Stack.Screen name="BookingForm" component={BookingFormScreen} />
  </Stack.Navigator>
);

// Tab Navigator principal
const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textSecondary,
      tabBarStyle: {
        backgroundColor: colors.white,
        borderTopColor: colors.border,
        elevation: 8,
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: -2 },
      },
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: '500',
        marginBottom: 4,
      },
    }}
  >
    <Tab.Screen
      name="Home"
      component={HomeStack}
      options={{
        tabBarLabel: 'Início',
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="home" color={color} size={size} />
        ),
      }}
    />
    <Tab.Screen
      name="Calendar"
      component={CalendarStack}
      options={{
        tabBarLabel: 'Calendário',
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="calendar-month" color={color} size={size} />
        ),
      }}
    />
    <Tab.Screen
      name="MyBookings"
      component={MyBookingsStack}
      options={{
        tabBarLabel: 'Meus Agendamentos',
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="format-list-bulleted" color={color} size={size} />
        ),
      }}
    />
  </Tab.Navigator>
);

// Stack Navigator principal que inclui a tela de registro e o Tab Navigator
const AppNavigator = ({ initialRoute = 'TeacherRegister' }) => (
  <Stack.Navigator
    initialRouteName={initialRoute}
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="TeacherRegister" component={TeacherRegisterScreen} />
    <Stack.Screen name="MainApp" component={TabNavigator} />
  </Stack.Navigator>
);

export default AppNavigator;
