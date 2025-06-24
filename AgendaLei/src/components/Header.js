// src/components/Header.js
import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import colors from '../config/colors';

const Header = ({ title, showBackButton = false, rightAction }) => {
  const navigation = useNavigation();

  return (
    <View style={styles.header}>
      <StatusBar backgroundColor={colors.primary} barStyle="light-content" />
      
      <View style={styles.headerContent}>
        {showBackButton ? (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.white} />
          </TouchableOpacity>
        ) : (
          <View style={styles.backButtonPlaceholder} />
        )}
        
        <Text style={styles.title}>{title}</Text>
        
        {rightAction ? (
          <TouchableOpacity style={styles.rightAction} onPress={rightAction.onPress}>
            <MaterialCommunityIcons
              name={rightAction.icon}
              size={24}
              color={colors.white}
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.rightActionPlaceholder} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.primary,
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 10,
    paddingBottom: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  backButtonPlaceholder: {
    width: 40,
  },
  title: {
    color: colors.white,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  rightAction: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  rightActionPlaceholder: {
    width: 40,
  },
});

export default Header;
